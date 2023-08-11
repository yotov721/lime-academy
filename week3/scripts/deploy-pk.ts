import { ethers } from "hardhat";
export async function main(_privateKey) {
    console.log(_privateKey);
    const wallet = new ethers.Wallet(_privateKey, ethers.provider); // New wallet with the privateKey passed from CLI as param
    console.log("Deploying contracts with the account:", wallet.address); // We are printing the address of the deployer
    const US_Election_Factory = await ethers.getContractFactory("USElection");
    const usElection = await US_Election_Factory.connect(wallet).deploy();
    await usElection.waitForDeployment();
    console.log(`The Election contract is deployed to ${usElection.target}`);
    const owner = await usElection.owner();
    console.log(`The Election contract owner is ${owner}`);
}