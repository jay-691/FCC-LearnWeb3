// these files work from the npm package hardhat-deploy.
// it makes it so the scripts/deploy.js file isnt needed.
const {
	networkConfig,
	developmentChains,
} = require('../helper-hardhat-config');
const { network } = require('hardhat');
const { verify } = require('../utils/verify');

// pulls out variables from hre automatically
module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;

	// if chainId is X use address Y
	let ethUsdPriceFeedAddress;
	if (developmentChains.includes(network.name)) {
		const ethUsdAggregator = await deployments.get('MockV3Aggregator');
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress =
			networkConfig[chainId]['ethUsdPriceFeedAddress'];
	}

	// if the contract doesnt exist, we deploy a minimal version of it
	// for our local testing

	const args = [ethUsdPriceFeedAddress];
	// when going for localhost or hard we need to use a mock
	const fundMe = await deploy('FundMe', {
		from: deployer,
		args, // price feed address
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, args);
	}

	log('-----------------------------');
};

module.exports.tags = ['all', 'fundme'];
