import { ethers } from "hardhat";

async function main() {
  const usElection = await ethers.deployContract("USElection");
  await usElection.waitForDeployment();

  console.log("USElection deployed to:", usElection.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
