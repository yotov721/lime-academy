import { ethers, run } from "hardhat";
export async function main() {
    const usElection = await ethers.deployContract("USElection");
    const tx = await usElection.deploymentTransaction();
    console.log("The Election contract is deployed to", usElection.target);
    await tx?.wait(5); // waiting for deployment confirmation
    try {
        await run("verify:verify", {
            address: usElection.target,
            constructorArguments: [],
        });
        console.log("Verified");
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(e);
        }
    }
}