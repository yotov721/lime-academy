import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CharityFund", function () {
    async function deployCharityFund() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const CharityFund = await ethers.getContractFactory("Charityfund");
        const charityFundContract = await CharityFund.deploy();

        const cause = "Cause1";
        const targetAmount = ethers.parseEther('2');
        const deadlineInDays = 1;
        await charityFundContract.createFund(cause, targetAmount, deadlineInDays);
        const fund = await charityFundContract.funds(0);

        return { charityFundContract, owner, otherAccount, targetAmount, fund };
    }

    describe("CreateFund", function () {
        it("Should create fund when the owner calls createFund", async function () {
            const { owner, charityFundContract } = await loadFixture(deployCharityFund);
            const cause = "Cause2";
            const targetAmount = ethers.parseEther("10");
            const deadline = 7;
            const initialFundsCount = await charityFundContract.fundsCount();

            await charityFundContract.connect(owner).createFund(cause, targetAmount, deadline);

            const newFundsCount = await charityFundContract.fundsCount();
            expect(newFundsCount).to.equal(initialFundsCount + BigInt(1));

            const newFund = await charityFundContract.funds(initialFundsCount);
            expect(newFund.cause).to.equal(cause);
            expect(newFund.targetAmount).to.equal(targetAmount);
            expect(newFund.deadline).to.equal(await time.latest() + time.duration.days(deadline));
            expect(newFund.isClosed).to.equal(false);
        })

        it('Should prevent non-owner from creating a fund', async function () {
            const { charityFundContract, otherAccount } = await loadFixture(deployCharityFund);
            const cause = 'Cause3';
            const targetAmount = ethers.parseEther('1');
            const deadlineInDays = 1;

            const createFundTx = charityFundContract.connect(otherAccount).createFund(cause, targetAmount, deadlineInDays);
            await expect(createFundTx).to.be.revertedWith('Ownable: caller is not the owner');
        });
    })

    describe("Donate", function () {
        it('Should allow donation when the fund is open and within the deadline', async function () {
            const { otherAccount, charityFundContract } = await loadFixture(deployCharityFund);
            const donationAmount = ethers.parseEther('1');

            await expect(charityFundContract.connect(otherAccount).donate(0, { value: donationAmount }))
                .to.emit(charityFundContract, 'DonationReceived')
                .withArgs(0, await otherAccount.getAddress(), donationAmount);

            const fund = await charityFundContract.funds(0);
            expect(fund.donatedAmount).to.equal(donationAmount);
        });

        it('Should prevent donation when the deadline has passed', async function () {
            const { otherAccount, charityFundContract } = await loadFixture(deployCharityFund);
            const donationAmount = ethers.parseEther('3');

            // Increase the time to simulate the deadline passing
            await time.increaseTo((await charityFundContract.funds(0)).deadline);

            const donateTx = charityFundContract.connect(otherAccount).donate(0, { value: donationAmount });
            await expect(donateTx).to.be.reverted;
        });

        it('Should prevent donation that exceeds the target amount', async function () {
            const { otherAccount, charityFundContract } = await loadFixture(deployCharityFund);
            const donationAmount = ethers.parseEther('6');

            const donateTx = charityFundContract.connect(otherAccount).donate(0, { value: donationAmount });
            await expect(donateTx).to.be.reverted;
        });

        it('Should close fund when donation goal meets the target amount', async function () {
            const { otherAccount, charityFundContract, targetAmount, fund } = await loadFixture(deployCharityFund);
            const donationAmount = targetAmount;

            const donateTx = charityFundContract.connect(otherAccount).donate(0, { value: donationAmount });
            await expect(donateTx).to.emit(charityFundContract, 'FundClosed')
                .withArgs(0, fund.targetAmount);
        });

        it("Should prevent donation when fund target is reached", async function () {
            const { otherAccount, charityFundContract, targetAmount, fund } = await loadFixture(deployCharityFund);
            const donationAmount = targetAmount;

            await charityFundContract.connect(otherAccount).donate(0, { value: donationAmount });
            const exceedDonatetx = charityFundContract.connect(otherAccount).donate(0, { value: 1 });

            await expect(exceedDonatetx).to.be.reverted;
        });
    })

    describe("CollectFunds", function () {
        it("Should allow the owner to collect funds when the fund is closed", async function () {
            const { owner, otherAccount, charityFundContract, targetAmount } = await loadFixture(deployCharityFund);
            await charityFundContract.connect(otherAccount).donate(0, { value: targetAmount });

            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
            await charityFundContract.connect(owner).collectFunds(0);
            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

            expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
        });

        it("Should revert when a non-owner tries to collect funds", async function () {
            const { otherAccount, charityFundContract } = await loadFixture(deployCharityFund);

            const collectFundsTx = charityFundContract.connect(otherAccount).collectFunds(0);
            await expect(collectFundsTx).to.be.reverted;
        });

        it("Should revert when trying to collect funds from an open fund", async function () {
            const { owner, charityFundContract } = await loadFixture(deployCharityFund);
            const collectFunbdsTx = charityFundContract.connect(owner).collectFunds(0);

            await expect(collectFunbdsTx).to.be.reverted;
        });
    });

    describe("getRefund", function () {
        it("Should allow a donor to claim a refund after the deadline", async function () {
            const { charityFundContract, otherAccount, targetAmount, fund } = await deployCharityFund();

            await charityFundContract.connect(otherAccount).donate(0, { value: targetAmount });
            await time.increaseTo(fund.deadline);

            const initialBalance = await ethers.provider.getBalance(otherAccount.address);
            await charityFundContract.connect(otherAccount).getRefund(0);
            const finalBalance = await ethers.provider.getBalance(otherAccount.address);

            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should not allow a donor to claim a refund before the deadline", async function () {
            const { charityFundContract, otherAccount } = await deployCharityFund();

            await charityFundContract.connect(otherAccount).donate(0, { value: ethers.parseEther("1") });

            await expect(charityFundContract.connect(otherAccount).getRefund(0)).to.be.reverted;
        });

        it("Should not allow a donor to claim a refund if they haven't donated", async function () {
            const { charityFundContract, otherAccount, fund } = await deployCharityFund();

            await time.increaseTo(fund.deadline);

            await expect(charityFundContract.connect(otherAccount).getRefund(0)).to.be.reverted;
        });
    })

    it("Should return total donated amount for a fund", async function () {
        const { charityFundContract, otherAccount, targetAmount } = await deployCharityFund();

        await charityFundContract.connect(otherAccount).donate(0, { value: targetAmount });

        const totalDonatedAmount = await charityFundContract.getTotalDonatedAmount(0);

        expect(totalDonatedAmount).to.equal(targetAmount);
    });

    describe("getRemainingAmountNeeded", function () {
        it("Should return remaining amount needed for a fund", async function () {
            const { charityFundContract, otherAccount, targetAmount } = await deployCharityFund();

            const donationAmount = ethers.parseEther("1");
            await charityFundContract.connect(otherAccount).donate(0, { value: donationAmount });

            const remainingAmountNeeded = await charityFundContract.getRemainingAmountNeeded(0);

            const expectedRemainingAmount = targetAmount - donationAmount;

            expect(remainingAmountNeeded).to.equal(expectedRemainingAmount);
        });

        it("Should return 0 for a fund that has closed", async function () {
            const { charityFundContract, otherAccount, targetAmount } = await deployCharityFund();

            await charityFundContract.connect(otherAccount).donate(0, { value: targetAmount });

            const remainingAmountNeeded = await charityFundContract.getRemainingAmountNeeded(0);

            expect(remainingAmountNeeded).to.equal(0);
        });
    });

    it("Should return that a fund is open before the deadline", async function () {
        const { charityFundContract } = await deployCharityFund();

        const isOpenBeforeDeadline = await charityFundContract.isFundOpen(0);

        expect(isOpenBeforeDeadline).to.be.true;
    });

    it("Should return that a fund is closed after the deadline", async function () {
        const { charityFundContract, otherAccount, targetAmount } = await deployCharityFund();

        await charityFundContract.connect(otherAccount).donate(0, { value: targetAmount.toString() });

        const fund = await charityFundContract.funds(0);
        await time.increaseTo(fund.deadline);
        const isClosedAfterDeadline = await charityFundContract.isFundOpen(0);

        expect(isClosedAfterDeadline).to.be.false;
    });
})
