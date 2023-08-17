import { ethers } from "hardhat";

async function main() {
    const provider = new ethers.InfuraProvider(
        "sepolia",
        "7e97ae83d8ee45fb816ddf90f5c29cdc"
    );
    const wallet = new ethers.Wallet(
        "330912a17ad3767738b1b93d968ded600ddbf72bd34ab4414c318f3456de9ec3",
        provider
    );
    let balance = await provider.getBalance(wallet.getAddress());
    console.log("Wallet balance before wrapping: " + balance.toString());
    const wrapValue = ethers.parseEther("1");
    const ETHWrapperContract = await ethers.getContractAt(
        "ETHWrapper",
        "0x24691fa08EffA0138CA794ea0dfa20E19c586011",
        wallet
    );
    console.log(ETHWrapperContract.target);

    // ????
    // const wethAddress = await ETHWrapperContract.WETHToken;
    // const WETHContract = await ethers.getContractAt("WETH", wethAddress, wallet);


    const tx = await ETHWrapperContract.wrap({ value: wrapValue });
    await tx.wait();

    let contractETHBalance = await provider.getBalance(ETHWrapperContract.target);
    console.log(
        "Contract ETH balance after wrapping:",
        contractETHBalance.toString()
    );

    balance = await provider.getBalance(wallet.getAddress());
    console.log("Wallet balance after wrapping: " + balance.toString());

    // Give the ETHWrapper access to your (user's) wrapped tokens so
    // when you call unwrap thje contract can get your tokensand give you eth
    // The contract burns the tokens and transfers ETH back to the user.
    //
    // const approveTx = await WETHContract.approve(
    //     ETHWrapperContract.target,
    //     wrapValue
    // );
    // await approveTx.wait();
    // const unwrapTx = await ETHWrapperContract.unwrap(wrapValue);
    // await unwrapTx.wait();
    // let balanceUnwrap = await WETHContract.balanceOf(wallet.address);
    // console.log("Balance after unwrapping:", balanceUnwrap.toString());
    // contractETHBalance = await provider.getBalance(ETHWrapperContract.target);
    // console.log(
    //     "Contract ETH balance after unwrapping:",
    //     contractETHBalance.toString()
    // );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

    //npx hardhat run .\scripts\interact.ts