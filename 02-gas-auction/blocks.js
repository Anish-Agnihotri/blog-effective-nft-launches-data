const fs = require("fs");
const axios = require("axios");
const { performance } = require("perf_hooks");

// Base eth RPC options
const baseOptions = {
  id: 0,
  jsonrpc: "2.0",
  method: "",
  params: [],
};

/**
 * Collects `limit` blocks via batch RPC eth_getBlockByNumber
 * @param {number} startBlock to query from
 * @param {number} limit number of blocks to query for
 * @returns {Promise<{ (string | number)[][], (string | number)[][]}>}
 * Object of blocks and transactions unnested for db insertion
 */
async function collectBlocks(startBlock, limit) {
  const t0 = performance.now(); // Performance benchmark
  let requests = []; // Batched RPC requests

  const generalOptions = {
    ...baseOptions,
    // Collect block by number
    method: "eth_getBlockByNumber",
  };

  // From startBlock...startBlock + limit
  for (let i = startBlock; i < startBlock + limit; i++) {
    // Collect blocks with full transaction opt toggled on
    const params = [`0x${i.toString(16)}`, false];
    // Push request to batch array (w/ diff index per request)
    requests.push({ ...generalOptions, id: i - startBlock, params });
  }

  // Collect blocks from RPC
  const { data } = await axios.post("http://localhost:8545", requests);
  const t1 = performance.now();
  console.log(`Collected ${data.length} blocks w/ tx. [${t1 - t0} ms]`);

  let blockToBaseFees = [];
  for (let i = 0; i < data.length; i++) {
    blockToBaseFees.push({
      block: parseInt(data[i].result.number, 16),
      baseFeePerGas: parseInt(data[i].result.baseFeePerGas, 16) / 1e9,
    });
  }
  return blockToBaseFees;
}

(async () => {
  let blocks = [];
  let sepFirstBlock = 13136427;
  let sepLastBlock = 13330089;

  while (sepFirstBlock < sepLastBlock) {
    const todo = Math.min(sepLastBlock - sepFirstBlock, 1000);
    blocks = blocks.concat(await collectBlocks(sepFirstBlock, todo));
    sepFirstBlock += todo;
  }

  await fs.writeFileSync("september-blocks.json", JSON.stringify(blocks));
})();
