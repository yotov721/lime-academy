import { ethers } from "hardhat";

async function main() {
    // Deploy WETH token
    const wethToken = await ethers.deployContract("WETH");
    await wethToken.waitForDeployment();

    console.log("WETH Token deployed to:", wethToken.target);

    // Deploy ETHWrapper contract
    const ethWrapper = await ethers.deployContract("ETHWrapper", [wethToken.target]);
    await ethWrapper.waitForDeployment();

    console.log("ETHWrapper deployed to:", ethWrapper.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run --network localhost .\scripts\deploy-wrapper.ts
