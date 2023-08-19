import { ethers } from "hardhat";

async function main() {
  const carCollection = await ethers.deployContract("carCollection");
  await carCollection.waitForDeployment();

  console.log(`Car contract with deployed to ${carCollection.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });