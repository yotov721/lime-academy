// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title Charityfund - A smart contract for managing charity funds.
 * @dev This contract allows the owner to create charity funds, receive donations, and refund donations.
 */
contract Charityfund is Ownable {
    using SafeMath for uint256;

    // Struct to represent a charity fund
    struct Fund {
        string cause;               // The cause or purpose of the fund
        uint256 targetAmount;       // The target amount of Ether to be raised
        uint256 donatedAmount;      // The total amount of Ether donated
        uint256 deadline;           // The deadline for donations
        bool isClosed;              // Flag indicating if the fund is closed
        mapping(address => uint256) userDonation; // Mapping of user addresses to their donations
    }

    // Mapping of fund IDs to Fund structs
    mapping(uint256 => Fund) public funds;

    // Total number of funds created
    uint256 public fundsCount;

    // Custom error messages for better clarity
    error FundClosedError();
    error DeadlineNotPassedError();
    error DonationExceedsTargetError();
    error FundNotClosedError();
    error NotDonatedError();

    // Events emitted by the contract
    event FundCreated(uint256 fundId, string cause, uint256 targetAmount, uint256 deadline);
    event DonationReceived(uint256 fundId, address indexed donor, uint256 amount);
    event FundClosed(uint256 fundId, uint256 totalDonated);
    event RefundClaimed(uint256 fundId, address donator, uint256 donatedAmount);

    /**
     * @dev Modifier to check if a fund is open.
     * @param fundId The ID of the fund to check.
     */
    modifier isOpen(uint256 fundId) {
        if (funds[fundId].isClosed) revert FundClosedError();
        _;
    }

    /**
     * @dev Creates a new charity fund.
     * @param _cause The cause or purpose of the fund.
     * @param _targetAmount The target amount of Ether to be raised.
     * @param _deadlineInDays The duration of the fund in days.
     */
    function createFund(string memory _cause, uint256 _targetAmount, uint256 _deadlineInDays) external onlyOwner {
        uint256 deadline = block.timestamp.add(_deadlineInDays.mul(1 days));
        Fund storage newFund = funds[fundsCount++];
        newFund.cause = _cause;
        newFund.targetAmount = _targetAmount;
        newFund.deadline = deadline;

        emit FundCreated(fundsCount, _cause, _targetAmount, deadline);
    }

    /**
     * @dev Allows users to donate Ether to a charity fund.
     * @param fundId The ID of the fund to donate to.
     */
    function donate(uint256 fundId) external payable isOpen(fundId) {
        Fund storage fund = funds[fundId];
        if (block.timestamp > fund.deadline) revert DeadlineNotPassedError();
        if (fund.donatedAmount.add(msg.value) > fund.targetAmount) revert DonationExceedsTargetError();

        fund.userDonation[msg.sender] = fund.userDonation[msg.sender].add(msg.value);
        fund.donatedAmount = fund.donatedAmount.add(msg.value);

        emit DonationReceived(fundId, msg.sender, msg.value);

        if (fund.donatedAmount >= fund.targetAmount) {
            fund.isClosed = true;
            emit FundClosed(fundId, fund.donatedAmount);
        }
    }

    /**
     * @dev Allows the owner to collect funds from a closed charity fund.
     * @param fundId The ID of the fund to collect funds from.
     */
    function collectFunds(uint256 fundId) external onlyOwner {
        Fund storage fund = funds[fundId];
        if (!fund.isClosed) revert FundNotClosedError();
        uint256 balance = fund.donatedAmount;
        fund.donatedAmount = 0;
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Allows users to claim a refund for their donation from a closed fund.
     * @param fundId The ID of the fund to claim a refund from.
     */
    function getRefund(uint256 fundId) external {
        Fund storage fund = funds[fundId];
        if (block.timestamp <= fund.deadline) revert DeadlineNotPassedError();
        uint256 amountToRefund = fund.userDonation[msg.sender];

        if (amountToRefund == 0) revert NotDonatedError();
        fund.userDonation[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amountToRefund}("");
        if (!success) revert("Refund failed");

        emit RefundClaimed(fundId, msg.sender, amountToRefund);
    }

    /**
     * @dev Gets the total amount of Ether donated to a fund.
     * @param fundId The ID of the fund to query.
     * @return The total donated amount.
     */
    function getTotalDonatedAmount(uint256 fundId) external view returns (uint256) {
        return funds[fundId].donatedAmount;
    }

    /**
     * @dev Gets the remaining amount needed to reach the target for a fund.
     * @param fundId The ID of the fund to query.
     * @return The remaining amount needed.
     */
    function getRemainingAmountNeeded(uint256 fundId) external view returns (uint256) {
        Fund storage fund = funds[fundId];
        if (fund.isClosed) {
            return 0;
        }
        return fund.targetAmount.sub(fund.donatedAmount);
    }

    /**
     * @dev Checks if a fund is open or closed.
     * @param fundId The ID of the fund to query.
     * @return True if the fund is open, false if closed.
     */
    function isFundOpen(uint256 fundId) external view returns (bool) {
        return !funds[fundId].isClosed;
    }
}
