// Usage: yarn hardhat run --network <network> scripts/deploy-bridge-adapter-v1.ts

import { ethers } from 'hardhat';

async function main() {
  const AIRoseDossier = await ethers.getContractFactory('AIRoseDossier');
  const aiRoseDossier = await AIRoseDossier.deploy(0, 0);
  console.log('AIRoseDossier deployed to:', aiRoseDossier.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
