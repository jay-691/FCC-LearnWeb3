const { getNamedAccounts, ethers } = require('hardhat');

async function main() {
	const { deployer } = await getNamedAccounts();
	const fundMe = await ethers.getContract('FundMe', deployer);
	console.log('Finding Contract...');
	const txResponse = await fundMe.withdraw();
	await txResponse.wait(1);
	console.log('Withdrawen funds');
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
