import { ethers, run, network } from 'hardhat';

async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        'SimpleStorage'
    );

    console.log('Deploying Contract...');
    const simpleStorage = await SimpleStorageFactory.deploy();
    await simpleStorage.deployed();
    console.log('Deployed contract to:', simpleStorage.address);
    // Check if network is Live/TestNet
    // console.log('Connected to network:', network.config);
    // 4 is Rinkeby
    if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
        console.log('Waiting for 6 block txs...');
        await simpleStorage.deployTransaction.wait(6);
        // verify that the contract has been deployed through etherscan
        await verify(simpleStorage.address, []);
    }

    const currentValue = await simpleStorage.retrieve();
    console.log('Current Value:', currentValue);

    const txResponse = await simpleStorage.store(7);
    await txResponse.wait(1);
    const updatedValue = await simpleStorage.retrieve();
    console.log('Updated Value:', updatedValue);
}

async function verify(contractAddress: string, args: any[]) {
    console.log('Verify Contract...');
    try {
        await run('verify:verify', {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (error: any) {
        if (error.message.toLowerCase().includes('already verified')) {
            console.warn('Already Verified!');
        }
        console.error(error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
