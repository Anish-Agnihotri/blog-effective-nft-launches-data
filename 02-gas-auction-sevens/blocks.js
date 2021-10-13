const fs = require("fs");
const ethers = require("ethers");

const startBlock = 13180400;
const endBlock = 13180432;

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

(async () => {
  let blockToBaseFee = [];
  for (let i = startBlock - 70; i <= endBlock + 70; i++) {
    const block = await provider.getBlock(i);
    blockToBaseFee.push({
      block: i,
      baseFeePerGas: block.baseFeePerGas.toNumber() / 1e9,
    });
  }

  await fs.writeFileSync("blocks.json", JSON.stringify(blockToBaseFee));
})();
