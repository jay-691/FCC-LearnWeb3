// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import './PriceConverter.sol';

// Best practive to include contract name in error so the tx knows what
// contract reverted the tx
error FundMe__NotOwner();

// Gas Price is determind from opcodes
// github.com/crytic/env-opcodes

// For more comments about this check FundMe project
/// @title A contract for crowd funding
/// @author Andrew Fletcher
/// @notice This contract is to learn contracts
/// @dev This was created from FreeCodeCamp Learn solidity youtube video
contract FundMe {
	// Type Declarations
	using PriceConverter for uint256;

	// State Variables
	mapping(address => uint256) private s_addressToAmountFunded;
	address[] private s_funders;
	AggregatorV3Interface private s_priceFeed;
	uint256 public constant MINIMUM_USD = 50;
	address private immutable i_owner;

	modifier onlyOwner() {
		if (msg.sender != i_owner) revert FundMe__NotOwner();
		_;
	}

	// Functions Order:
	// - constructor
	// - recieve
	// - fallback
	// - external
	// - public
	// - internal
	// - private
	// - view / pure

	constructor(address priceFeedAddress) {
		i_owner = msg.sender;
		s_priceFeed = AggregatorV3Interface(priceFeedAddress);
	}

	// receive() external payable {
	// 	fund();
	// }

	// fallback() external payable {
	// 	fund();
	// }

	/// @notice This function funds this contract
	/// @dev Implements price feeds as our library
	function fund() public payable {
		require(
			msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
			'You need to send more ETH!'
		);
		s_addressToAmountFunded[msg.sender] += msg.value;
		s_funders.push(msg.sender);
	}

	function withdraw() public payable onlyOwner {
		for (uint256 i = 0; i < s_funders.length; i++) {
			address funder = s_funders[i];
			s_addressToAmountFunded[funder] = 0;
		}
		s_funders = new address[](0);

		(bool callSuccess, ) = payable(msg.sender).call{
			value: address(this).balance
		}('');
		// calling error is cheaper than storing string
		require(callSuccess, 'Call Error');
	}

	function cheaperWithdraw() public payable onlyOwner {
		// mappings cannot be in memory
		// memory is cheaper when reading from it
		address[] memory funders = s_funders;
		for (uint256 i = 0; i < funders.length; i++) {
			address funder = funders[i];
			s_addressToAmountFunded[funder] = 0;
		}
		s_funders = new address[](0);
		(bool success, ) = i_owner.call{value: address(this).balance}('');
		require(success, 'Call Error');
	}

	// - view / pure
	function getOwner() public view returns (address) {
		return i_owner;
	}

	function getFunder(uint256 index) public view returns (address) {
		return s_funders[index];
	}

	function getAddressToAmountFunded(address funder)
		public
		view
		returns (uint256)
	{
		return s_addressToAmountFunded[funder];
	}

	function getPriceFeed() public view returns (AggregatorV3Interface) {
		return s_priceFeed;
	}
}
