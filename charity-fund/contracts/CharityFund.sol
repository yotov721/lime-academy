// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Charityfund is Ownable {
    using SafeMath for uint256;

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

    function createFund(string memory _cause, uint256 _targetAmount, uint256 _deadlineInDays) external onlyOwner {
        uint256 deadline = block.timestamp.add(_deadlineInDays.mul(1 days));
        Fund storage newFund = funds[fundsCount++];
        newFund.cause = _cause;
        newFund.targetAmount = _targetAmount;
        newFund.deadline = deadline;

        emit FundCreated(fundsCount, _cause, _targetAmount, deadline);
    }

    function donate(uint256 fundId) external payable isOpen(fundId) {
        Fund storage fund = funds[fundId];
        require(block.timestamp <= fund.deadline, "Donations are closed, and the deadline has passed");
        require(fund.donatedAmount.add(msg.value) <= fund.targetAmount, "Donation exceeds the target amount");

        fund.userDonation[msg.sender] = fund.userDonation[msg.sender].add(msg.value);
        fund.donatedAmount = fund.donatedAmount.add(msg.value);

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
        // Draining of funds prevention during re-entrancy
        fund.donatedAmount = 0;
        payable(owner()).transfer(balance);
    }

    function getRefund(uint256 fundId) external {
        Fund storage fund = funds[fundId];
        require(block.timestamp > fund.deadline, "The fund is still running");
        uint256 amountToRefund = fund.userDonation[msg.sender];

        require(amountToRefund > 0, "You haven't donated to this fund");
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
        return fund.targetAmount.sub(fund.donatedAmount);
    }

    function isFundOpen(uint256 fundId) external view returns (bool) {
        return !funds[fundId].isClosed;
    }
}
