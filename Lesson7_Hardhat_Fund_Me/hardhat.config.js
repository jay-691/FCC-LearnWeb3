require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
require('hardhat-gas-reporter');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-deploy');

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	// solidity: '0.8.9',
	solidity: {
		compilers: [{ version: '0.8.9' }, { version: '0.6.6' }],
	},
	defaultNetwork: 'hardhat',
	networks: {
		rinkeby: {
			url: RINKEBY_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 4,
			blockConfirmations: 6,
		},
	},
	gasReporter: {
		enabled: true,
		currency: 'USD',
		outputFile: 'gas-report.txt',
		coinmarketcap: COINMARKETCAP_API_KEY,
		noColors: true,
		token: 'ETH',
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		user: {
			default: 1,
		},
	},
};
