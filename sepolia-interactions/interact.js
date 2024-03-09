const { ethers } = require("ethers");
const USElection = require("./USElection.json");

const run = async function () {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    // const balance = await provider.getBalance(wallet.getAddress());
    // console.log(balance.toString())

    // wei to eth
    // console.log(ethers.formatEther(balance, 18))

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your contract address
    const electionContract = new ethers.Contract(contractAddress, USElection.abi, wallet);

    const hasEnded = await electionContract.electionEnded();
    console.log("The election has ended:", hasEnded);

    const haveResultsForOhio = await electionContract.resultsSubmitted("Ohio");
    console.log("Have results for Ohio:", haveResultsForOhio);

    const transactionOhio = await electionContract.submitStateResult([
        "Ohio",
        250,
        150,
        24,
    ]);
    const transactionReceipt = await transactionOhio.wait();
    if (transactionReceipt.status != 1) {
        // 1 means success
        console.log("Transaction was not successful");
        return;
    }
    const resultsSubmittedOhioNew = await electionContract.resultsSubmitted(
        "Ohio"
    );
    console.log("Results submitted for Ohio", resultsSubmittedOhioNew);
    const currentLeader = await electionContract.currentLeader();
    console.log("Current leader", currentLeader.toString());
};

run();
