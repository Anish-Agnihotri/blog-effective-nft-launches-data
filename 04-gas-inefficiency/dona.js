const fs = require("fs");

(async () => {
  const commitments = JSON.parse(await fs.readFileSync("./commitments.json"));

  let amounts = {};
  for (let i = 0; i < commitments.length; i++) {
    if (commitments[i].address in amounts) {
      amounts[commitments[i].address] += commitments[i].claimable;
    } else {
      amounts[commitments[i].address] = commitments[i].claimable;
    }
  }

  let participants = 0;
  let few = 0;
  let justEnough = 0;
  let excess = 0;
  for (const [_, claimable] of Object.entries(amounts)) {
    participants++;
    if (claimable % 1 === 0) {
      justEnough++;
    } else if (claimable < 1) {
      few++;
    } else {
      excess++;
    }
  }

  console.log("Unique participants: ", participants);
  console.log(`Few: ${few}, Enough: ${justEnough}, Excess: ${excess}`);
})();
