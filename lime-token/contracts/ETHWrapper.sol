// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./WETH.sol";

contract ETHWrapper {
    WETH public wethToken;

    event LogETHWrapped(address sender, uint256 amount);
    event LogETHUnwrapped(address sender, uint256 amount);

    constructor(address _address) {
        wethToken = WETH(_address);
    }

    function wrap() public payable {
        require(msg.value > 0, "We need to wrap at least 1 WETH");
        wethToken.mint(msg.sender, msg.value);
        emit LogETHWrapped(msg.sender, msg.value);
    }

    function unwrap(uint256 value) public {
        require(value > 0, "We need to unwrap at least 1 WETH");
        wethToken.transferFrom(msg.sender, address(this), value);
        wethToken.burn(value);
        payable(msg.sender).transfer(value);
        emit LogETHUnwrapped(msg.sender, value);
    }

    receive() external payable {
        wrap();
    }
}
