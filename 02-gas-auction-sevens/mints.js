const fs = require("fs");
const ethers = require("ethers");

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "minter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "SaleMint",
    type: "event",
  },
];

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const contract = new ethers.Contract(
  "0xf497253c2bb7644ebb99e4d9ecc104ae7a79187a",
  abi,
  provider
);

(async () => {
  const mintFilter = contract.filters.SaleMint();
  const events = await contract.queryFilter(mintFilter);

  let mints = [];
  let blocks = {};
  console.log("Total: ", events.length);
  for (let i = 0; i < events.length; i++) {
    console.log(i);
    const blockNumber = events[i].blockNumber;

    let block;
    if (blockNumber.toString() in blocks) {
      block = blocks[blockNumber.toString()];
    } else {
      block = await provider.getBlockWithTransactions(blockNumber);
      blocks[blockNumber.toString()] = block;
    }

    let fees = {};
    for (let j = 0; j < block.transactions.length; j++) {
      if (block.transactions[j].hash === events[i].transactionHash) {
        fees.gasPrice = block.transactions[j].gasPrice.div(1e9).toNumber();
        fees.gasLimit = block.transactions[j].gasLimit.toNumber();
        fees.mintTxCost = Number(
          ethers.utils.formatEther(
            block.transactions[j].gasPrice.mul(block.transactions[j].gasLimit)
          )
        );
      }
    }

    mints.push({
      blockNumber,
      transactionHash: events[i].transactionHash,
      minter: events[i].args[0],
      numMinted: events[i].args[1].toNumber(),
      ...fees,
    });
  }

  // Filter for contracts
  let mintHashes = {};
  for (let i = 0; i < mints.length; i++) {
    if (mints[i].transactionHash in mintHashes) {
      let mint = mintHashes[mints[i].transactionHash];
      mint.numMinted++;
      mintHashes[mints[i].transactionHash] = mint;
    } else {
      mintHashes[mints[i].transactionHash] = mints[i];
    }
  }

  await fs.writeFileSync(
    "mints.json",
    JSON.stringify(Object.values(mintHashes))
  );
})();
