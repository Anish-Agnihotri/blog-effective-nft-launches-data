const fs = require("fs");

(async () => {
  const septemberBlocks = JSON.parse(
    await fs.readFileSync("./september-blocks.json")
  );

  for (let i = 0; i < septemberBlocks.length; i++) {
    if (septemberBlocks[i].baseFeePerGas > 1250) {
      console.log(septemberBlocks[i].block, septemberBlocks[i].baseFeePerGas);
    }
  }
})();
