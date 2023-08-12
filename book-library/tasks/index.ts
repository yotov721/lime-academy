import { ethers } from "hardhat";

export async function deploy() {
    const bookLibrary = await ethers.deployContract("BookLibrary");
    const tx = await bookLibrary.deploymentTransaction();
    console.log("The BookLibrary contract is deployed to: ", bookLibrary.target);
}

export async function deployLocally() {
    const bookLibrary = await ethers.deployContract("BookLibrary");
    const tx = await bookLibrary.deploymentTransaction();
    console.log("The BookLibrary contract is deployed to: ", bookLibrary.target);
    await tx?.wait(5);
}