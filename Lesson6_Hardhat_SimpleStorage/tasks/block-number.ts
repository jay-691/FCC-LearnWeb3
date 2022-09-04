import { task } from 'hardhat/config';

export default task('block-number', 'Print current block number').setAction(
	// hre - Hardhat Runtime Enviroment
	async (taskArgs, hre) => {
		const blockNumber = await hre.ethers.provider.getBlockNumber();
		console.log('Current Block Number:', blockNumber);
	}
);
