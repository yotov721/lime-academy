import { ethers } from "hardhat";

export async function main() {
  const lime = await ethers.deployContract("LimeToken");
  await lime.waitForDeployment();

  console.log(`Lime contract with deployed to ${lime.target}`);
}
