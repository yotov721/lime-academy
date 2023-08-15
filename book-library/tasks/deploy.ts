import { ethers } from "hardhat";

async function main() {
  const bookLibrary = await ethers.deployContract("BookLibrary");
  await bookLibrary.waitForDeployment();

  console.log("BookLibrary deployed to:", bookLibrary.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
