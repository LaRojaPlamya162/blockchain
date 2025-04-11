// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vendor is Ownable {
    IERC20 public yourToken;
    uint256 public constant tokensPerEth = 100;

    event BuyTokens(address buyer, uint256 ethAmount, uint256 tokenAmount);
    event SellTokens(address seller, uint256 tokenAmount, uint256 ethAmount);

    constructor(address tokenAddress) Ownable(msg.sender) {
        yourToken = IERC20(tokenAddress);
    }

    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 tokensToBuy = msg.value * tokensPerEth;
        require(yourToken.balanceOf(address(this)) >= tokensToBuy, "Vendor has not enough tokens");
        yourToken.transfer(msg.sender, tokensToBuy);
        emit BuyTokens(msg.sender, msg.value, tokensToBuy);
    }

    function sellTokens(uint256 tokenAmount) public {
        require(tokenAmount > 0, "Amount must be > 0");
        uint256 ethAmount = tokenAmount / tokensPerEth;
        require(address(this).balance >= ethAmount, "Not enough ETH in vendor");

        require(yourToken.allowance(msg.sender, address(this)) >= tokenAmount, "Vendor not approved");
        yourToken.transferFrom(msg.sender, address(this), tokenAmount);
        payable(msg.sender).transfer(ethAmount);

        emit SellTokens(msg.sender, tokenAmount, ethAmount);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
