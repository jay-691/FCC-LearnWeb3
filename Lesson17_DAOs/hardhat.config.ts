// require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-etherscan");
// require("hardhat-deploy");
// require("solidity-coverage");
// require("hardhat-gas-reporter");
// require("hardhat-contract-sizer");
// require("dotenv").config();

// const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
// const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import { HardhatUserConfig } from "hardhat/config";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.9",
	defaultNetwork: "hardhat",
	namedAccounts: {
		deployer: {
			default: 0,
		}
	},
	networks: {
		hardhat: {
			chainId: 31337,
			blockConfirmations: 1,
		},
		localhost: {
			chainId: 31337,
			blockConfirmations: 1,
		},
		// rinkeby: {
		//     chainId: 4,
		//     blockConfirmations: 6,
		//     url: RINKEBY_RPC_URL,
		//     accounts: [PRIVATE_KEY],
		// },
	},
	// gasReporter: {
	//     enabled: false,
	//     currency: "USD",
	//     outputFile: "gas-report.txt",
	//     coinmarketcap: COINMARKETCAP_API_KEY,
	//     noColors: true,
	//     token: "ETH",
	// },
	// namedAccounts: {
	//     deployer: {
	//         default: 0,
	//     },
	//     player: {
	//         default: 1,
	//     },
	// },
	// etherscan: {
	//     // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
	//     apiKey: {
	//         rinkeby: ETHERSCAN_API_KEY,
	//     },
	// },
	// mocha: {
	//     timeout: 2000000,
	// },
};
