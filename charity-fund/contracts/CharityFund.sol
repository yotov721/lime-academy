// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Charityfund is Ownable {
    struct Fund {
        string cause;
        uint256 targetAmount;
        uint256 donatedAmount;
        uint256 deadline;
        bool isClosed;
        mapping(address => uint256) userDonation;
    }

    mapping(uint256 => Fund) public funds;
    uint256 public fundsCount;

    event FundCreated(uint256 fundId, string cause, uint256 targetAmount, uint256 deadline);
    event DonationReceived(uint256 fundId, address indexed donor, uint256 amount);
    event FundClosed(uint256 fundId, uint256 totalDonated);
    event RefundClaimed(uint256 fundId, address donator, uint256 donatedAmount);

    modifier isOpen(uint256 fundId) {
        require(!funds[fundId].isClosed, "The fund has finished");
        _;
    }

    function createFund(string memory _cause, uint256 _targetAmount, uint16 _deadlineInDays) external onlyOwner {
        Fund storage newFund = funds[fundsCount++];
        newFund.cause = _cause;
        newFund.targetAmount = _targetAmount;
        newFund.donatedAmount = 0;
        newFund.deadline = block.timestamp + _deadlineInDays * 1 days;
        newFund.isClosed = false;

        emit FundCreated(fundsCount - 1, _cause, _targetAmount, _deadlineInDays);
    }

    function donate(uint256 fundId) external payable isOpen(fundId) {
        Fund storage fund = funds[fundId];
        require(block.timestamp <= fund.deadline, "Donations are closed, and the deadline has passed");
        require(fund.donatedAmount + msg.value <= fund.targetAmount, "Donation exceeds the target amount");

        fund.userDonation[msg.sender] += msg.value;
        fund.donatedAmount += msg.value;

        emit DonationReceived(fundId, msg.sender, msg.value);

        if (fund.donatedAmount >= fund.targetAmount) {
            fund.isClosed = true;
            emit FundClosed(fundId, fund.donatedAmount);
        }
    }

    function collectFunds(uint256 fundId) external onlyOwner {
        Fund storage fund = funds[fundId];
        require(fund.isClosed, "The fund is still running");
        uint256 balance = fund.donatedAmount;
        payable(owner()).transfer(balance);
    }

    function getRefund(uint256 fundId) external {
        Fund storage fund = funds[fundId];
        require(block.timestamp > fund.deadline, "The is still running");
        require(fund.userDonation[msg.sender] > 0, "You haven't donated to this fund");
        uint256 amountToRefund = fund.userDonation[msg.sender];

        fund.userDonation[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amountToRefund}("");
        require(success, "Refund failed");

        emit RefundClaimed(fundId, msg.sender, amountToRefund);
    }

    function getTotalDonatedAmount(uint256 fundId) external view returns (uint256) {
        return funds[fundId].donatedAmount;
    }

    function getRemainingAmountNeeded(uint256 fundId) external view returns (uint256) {
        Fund storage fund = funds[fundId];
        if (fund.isClosed) {
            return 0;
        }
        uint256 remainingAmount = fund.targetAmount - fund.donatedAmount;
        return remainingAmount;
    }

    function isFundOpen(uint256 fundId) external view returns (bool) {
        return !funds[fundId].isClosed;
    }
}
