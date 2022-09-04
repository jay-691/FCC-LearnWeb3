import { ethers } from 'hardhat';
import { expect, assert } from 'chai';

import { SimpleStorage, SimpleStorage__factory } from '../typechain-types';

describe('SimpleStorage', function () {
	let simpleStorageFactory: SimpleStorage__factory;
	let simpleStorage: SimpleStorage;

	beforeEach(async function () {
		simpleStorageFactory = (await ethers.getContractFactory('SimpleStorage')) as SimpleStorage__factory;
		simpleStorage = await simpleStorageFactory.deploy();
	});

	it('Should start with a favorite number of zero', async function () {
		const currentValue = await simpleStorage.retrieve();
		const expectedValue = '0';
		// Both do the same thing just different syntax
		// assert.equal(currentValue.toString(), expectedValue);
		expect(currentValue.toString()).to.equal(expectedValue);
	});
	it('Should update when we call store', async function () {
		const expectedValue = '7';
		const txResponse = await simpleStorage.store(expectedValue);
		await txResponse.wait(1);

		const currentValue = await simpleStorage.retrieve();
		assert.equal(currentValue.toString(), expectedValue);
	});
});
