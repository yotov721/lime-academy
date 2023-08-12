import { ethers } from "hardhat";

export async function deploy() {
    const bookLibrary = await ethers.deployContract("BookLibrary");
    const tx = await bookLibrary.deploymentTransaction();
    console.log("The BookLibrary contract is deployed to: ", bookLibrary.target);
}

export async function deployLocally() {
    const [deployer] = await ethers.getSigners();

    const BookLibraryFactory = await ethers.getContractFactory("BookLibrary", deployer);
    const bookLibrary = await BookLibraryFactory.deploy();
    await bookLibrary.waitForDeployment();

    console.log(`BookLibrary deployed by ${deployer.address} to ${bookLibrary.target}`);

}