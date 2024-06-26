import { USElection } from "../typechain-types/USElection";
import { HardhatEthersSigner } from "hardhat/types";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("USElection", function () {
    let usElection: USElection;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;


    before(async () => {
        const [owner, addr1] = await ethers.getSigners();
        usElection = await ethers.deployContract("USElection");
        await usElection.waitForDeployment();
    });

    it("Should return the current leader before submit any election results", async function () {
        expect(await usElection.currentLeader()).to.equal(0); // NOBODY
    });

    it("Should return the election status", async function () {

        expect(await usElection.electionEnded()).to.equal(false); // Not Ended
    });

    it("Should submit state results and get current leader", async function () {
        const stateResults = ["California", 1000, 900, 32];
        const submitStateResultsTx = await usElection.submitStateResult(stateResults);
        await submitStateResultsTx.wait();
        expect(await usElection.currentLeader()).to.equal(1); // BIDEN
    });

    it("Should throw when try to submit already submitted state results", async function () {
        const stateResults = ["California", 1000, 900, 32];
        expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
            "This state result was already submitted!"
        );
    });

    it("Should submit state results and get current leader", async function () {
        const stateResults = ["Ohaio", 800, 1200, 33];
        const submitStateResultsTx = await usElection.submitStateResult(stateResults);
        await submitStateResultsTx.wait();
        expect(await usElection.currentLeader()).to.equal(2); // TRUMP
    });

    it("Should throw on trying to end election with not the owner", async function () {
        expect(usElection.connect(addr1).endElection()).to.be.revertedWith('Ownable: caller is not the owner');
        expect(await usElection.electionEnded()).to.equal(false); // Not Ended
    });

    it("Should end the elections, get the leader and election status", async function () {
        const endElectionTx = await usElection.endElection();
        await endElectionTx.wait();
        expect(await usElection.currentLeader()).to.equal(2); // TRUMP
        expect(await usElection.electionEnded()).to.equal(true); // Ended
    });
});
