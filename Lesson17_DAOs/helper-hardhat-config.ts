// const { ethers } = require("hardhat");

// const networkConfig = {
//   4: {
//     name: "rinkeby",
//     vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
//     gasLane:
//       "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
//     subscriptionId: "21051",
//     callbackGasLimit: "500000", // 500,000 gas
//     mintFee: "10000000000000000",
//     ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
//   },
//   31337: {
//     name: "hardhat",
//     gasLane:
//       "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
//     callbackGasLimit: "500000", // 500,000 gas
//     mintFee: "10000000000000000",
//     ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
//   },
// };

export const developmentChains = ["hardhat", "localhost"];

// module.exports = {
//   networkConfig,
//   developmentChains,
// };

export const MIN_DELAY = 3600;
export const VOTING_PERIOD = 5;
export const VOTING_DELAY = 1;
export const QUORUM_PERCENTAGE = 4;
export const ADDRESS_ZERO = "0x0000000000000000000000000000";
export const NEW_STORE_VALUE = 77;
export const FUNC = "store";
export const PROPOSAL_DESCRIPTION = "Proposal #1: Store 77 in the box";
