const fs = require("fs");
const ethers = require("ethers");

const saleStart = 12910355;
const saleEndMax = 12910524;
const mewntFunction = "0xcec3dc59";
const address = ethers.utils.getAddress(
  "0xd4d871419714b778ebec2e22c7c53572b573706e"
);
const iStoner = new ethers.utils.Interface([
  {
    inputs: [{ internalType: "uint256", name: "numTokens", type: "uint256" }],
    name: "mewnt",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
]);
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

(async () => {
  let tokensMintedAtSize = {};

  for (let i = saleStart; i <= saleEndMax; i++) {
    const block = await provider.getBlockWithTransactions(i);
    const transactions = block.transactions;

    for (let j = 0; j < transactions.length; j++) {
      if (
        transactions[j].to === address &&
        transactions[j].data.startsWith(mewntFunction)
      ) {
        try {
          await transactions[j].wait();
          const tx = iStoner.parseTransaction(transactions[j]);
          const numTokens = tx.args[0].toNumber();
          if (numTokens in tokensMintedAtSize) {
            tokensMintedAtSize[numTokens] += numTokens;
          } else {
            tokensMintedAtSize[numTokens] = numTokens;
          }
        } catch {
          console.log("Skipping because failing transaction");
        }
      }
    }
  }

  let mints = [];
  for (const [key, value] of Object.entries(tokensMintedAtSize)) {
    mints.push({ num: key, minted: value });
  }
  await fs.writeFileSync("./tokens-minted.json", JSON.stringify(mints));
})();
