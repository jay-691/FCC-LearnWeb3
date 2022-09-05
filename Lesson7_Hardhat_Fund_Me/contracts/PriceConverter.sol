// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

library PriceConverter {
	// instead of using ChainLink for the priceFeed address we pass it in from FundMe
	// constructor which gets it from when it is deployed
	function getPrice(AggregatorV3Interface priceFeed)
		internal
		view
		returns (uint256)
	{
		// Need:
		// - ABI
		// - Address for ETH -> USD - 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
		// AggregatorV3Interface priceFeed = AggregatorV3Interface(
		// 	0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
		// );
		(, int256 price, , , ) = priceFeed.latestRoundData();
		// ETH in terms of USD
		return uint256(price * 1e10);
	}

	// function getVersion() internal view returns (uint256) {
	// 	AggregatorV3Interface priceFeed = AggregatorV3Interface(
	// 		0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
	// 	);
	// 	return priceFeed.version();
	// }

	// Param is automatically passed in on the thing it has been called on.
	// e.g. msg.value.getConversionRate()
	// msg.value will be passed in the param automatically.
	// But if there was a second param we would need to pass that in the brackets.
	function getConversionRate(
		uint256 ethAmount,
		AggregatorV3Interface priceFeed
	) internal view returns (uint256) {
		uint256 ethPrice = getPrice(priceFeed);
		// 1500_000000000000000000 == 1 ETH in USD
		// 1_000000000000000000 == 1 ETH
		uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18; // need to devide so it doesnt have extra 0s on the end.
		// 1500 == ETH in USD without the extra 18 zeros
		return ethAmountInUsd;
	}
}
