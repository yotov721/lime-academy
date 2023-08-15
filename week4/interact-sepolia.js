const { ethers } = require("ethers");
const USElection = require('./USElection.json')
const dotenv = require("dotenv");
dotenv.config();

const run = async function() {
const provider = new ethers.InfuraProvider("sepolia", process.env.INFURA_KEY)

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
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