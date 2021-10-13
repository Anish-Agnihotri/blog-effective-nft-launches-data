const fs = require("fs");

(async () => {
  let mints = JSON.parse(await fs.readFileSync("./mints.json"));

  for (let i = 0; i < mints.length; i++) {
    mints[i].ethPerNFT = mints[i].mintTxCost / mints[i].numMinted;
  }

  // Collect median
  const sortedByEthPaid = mints.sort((a, b) => a.ethPerNFT - b.ethPerNFT);
  const median = sortedByEthPaid[Math.floor(sortedByEthPaid.length / 2)];
  console.log("Median: ", median);

  // Collect top 10%
  const top10Percent =
    sortedByEthPaid[
      Math.floor(sortedByEthPaid.length - sortedByEthPaid.length / 20)
    ];
  console.log("Top 10%: ", top10Percent);

  // Max gas price
  const sortedByGasPrice = mints.sort((a, b) => a.gasPrice - b.gasPrice);
  console.log("Max: ", sortedByGasPrice[sortedByGasPrice.length - 1]);
})();
