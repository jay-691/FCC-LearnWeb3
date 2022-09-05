const { run } = require('hardhat');

async function verify(contractAddress, args) {
	console.log('Verify Contract...');
	try {
		await run('verify:verify', {
			address: contractAddress,
			constructorArguments: args,
		});
	} catch (error) {
		if (error.message.toLowerCase().includes('already verified')) {
			console.warn('Already Verified!');
		}
		console.error(error);
	}
}

module.exports = { verify };
