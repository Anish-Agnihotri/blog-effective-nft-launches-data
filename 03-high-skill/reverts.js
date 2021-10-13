const ethers = require("ethers");

const startBlock = 13282938;
const endBlock = startBlock + 100;
const timesContract = "0xDd69da9a83ceDc730bc4d3C56E96D29Acc05eCDE";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

(async () => {
  let totalReverts = 0;
  let totalRevertCosts = 0;
  let addresses = [];

  for (let i = startBlock; i <= endBlock; i++) {
    console.log("Block number: ", i);
    console.log(`Current address set: `, [...new Set(addresses)].length);
    const block = await provider.getBlockWithTransactions(i);
    const transactions = block.transactions;

    for (let j = 0; j < transactions.length; j++) {
      try {
        await transactions[j].wait();
      } catch (e) {
        if (e.receipt.status === 0 && e.receipt.to === timesContract) {
          const amountLost = Number(
            ethers.utils.formatEther(
              e.receipt.gasUsed.mul(e.receipt.effectiveGasPrice)
            )
          );
          totalReverts++;
          totalRevertCosts += amountLost;
          addresses.push(e.receipt.from);
        }
      }
    }
  }

  console.log(`${totalReverts} reverts costing ${totalRevertCosts} ETH`);
})();
