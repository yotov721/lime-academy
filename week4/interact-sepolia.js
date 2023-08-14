const { ethers } = require("ethers");
const USElection = require('./USElection.json')

const run = async function() {
const provider = new ethers.InfuraProvider("sepolia", "6f5b2a5aa4a24df19d90749cf3b59934")

const wallet = new ethers.Wallet("32f1764f5735ff1f39387c4b14af8c570d6e435afe24eef9a663666b470ed8d3", provider)
const balance = await provider.getBalance(wallet.getAddress())
console.log("Balance: " + balance)

const electionContract = new ethers.Contract("0xCe35f7D6AA1E20db78E64Ea6db1305876b85276c", USElection.abi, wallet)

const transactionOhio = await electionContract.submitStateResult({name: "Ohio",votesBiden: 250,votesTrump: 150,stateSeats: 24});
console.log("State Result Submission Transaction:", transactionOhio.hash);
const transactionReceipt = await transactionOhio.wait();
if (transactionReceipt.status != 1) {
console.log("Transaction was not successful")
return
}

const resultsSubmittedOhioNew = await electionContract.resultsSubmitted("Ohio")
console.log("Results submitted for Ohio", resultsSubmittedOhioNew);

const currentLeader = await electionContract.currentLeader();
console.log("Current leader", currentLeader.toString());
}

run()