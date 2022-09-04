// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

// custom error saving gas
error NotOwner();

// Creating costs about 859,757 gas
contract FundMe {
	using PriceConverter for uint256;

	// Using constant saves gas - maybe about 2000 gas
	uint256 public constant MIN_USD = 50 * 1e18;

	address[] public funders;
	mapping(address => uint256) public addressToAmountFunded;

	// Using immutable saves gas - maybe about 2000 gas
	// immutable is where the value changes but is only called once.
	address public immutable i_owner;
	constructor() {
		// ran as soon as contract in initilized
		i_owner = msg.sender;
	}

	function fund() public payable {
		// We want to set a minimum fund amout in USD.
		// Anything below require() needs to match the first param to continue
		// otherwise anything above is undone.
		// Able to use getConversionRate() on msg.value as we are importing the library PriceConverter
		// where the function exists.
		require(msg.value.getConversionRate() >= MIN_USD, "Didn't send enough ETH."); // 1e18 == 1 * 10^18 == 1000000000000000000
		// msg.value will have 18 decimal places.
		funders.push(msg.sender);
		addressToAmountFunded[msg.sender] += msg.value;
	}

	// only owner can call this function
	// onlyOwner is a modifier which runs before running the functions code.
	function withdraw() public onlyOwner {
		// require(msg.sender == owner, "Sender is no Owner!");

		for (uint256 i = 0; i < funders.length; i++) {
			address funder = funders[i];

			addressToAmountFunded[funder] = 0;
		}
		// reset array
		// remove all funders as they are no longer funders if they have funded 0 amount
		funders = new address[](0);
		// actually withdraw funds

		// // == transfer ==
		// // If this fails it will throw error and revert transaction
		// // msg.sender == address
		// // payable(msg.sender) == payable address
		// payable(msg.sender).transfer(address(this).balance);

		// // == send ==
		// // If this fails then it will return a boolean of false and not revert
		// bool sendSuccess = payable(msg.sender).send(address(this).balance);
		// // It will only revert seen as this condition to this require is false.
		// require(sendSuccess, "Send Failed");

		// == call ==
		// dont want to call function so leave it blank e.g. ""
		// dont call a function but pass in address
		// returns 2 variables
		// bytes are arrays so needs to be put in memory. Similar with strings
		(bool callSuccess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("");
		require(callSuccess, "Call Failed");

		// Visit: solidity-by-example.org/sending-ether for more information.
	}

	modifier onlyOwner {
		// require(msg.sender == i_owner, "Sender is not owner!");
		if (msg.sender != i_owner) {
			revert NotOwner();
		}
		// represents reset of code from the function it was used on.
		// if this was above require the function code would run first then the require instead.
		_;
	}

	// What happens if someone sends this contract ETH without calling fund()
	// This is make them forced to call fund() even if they dont directly call it
	// or another function
	// == receive ==
	receive() external payable {
		fund();
	}
	// == fallback ==
	fallback() external payable {
		fund();
	}
}