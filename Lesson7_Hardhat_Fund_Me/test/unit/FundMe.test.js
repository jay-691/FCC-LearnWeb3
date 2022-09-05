const { deployments, ethers, getNamedAccounts, network } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
	? describe.skip
	: describe('FundMe', async function () {
			let fundMe;
			let deployer;
			let mockV3Aggregator;
			const sendValue = ethers.utils.parseEther('51');
			beforeEach(async function () {
				// deploy fundMe contract
				// using hardhat-deploy npm package
				// const accounts = await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['all']);
				fundMe = await ethers.getContract('FundMe', deployer);
				mockV3Aggregator = await ethers.getContract('MockV3Aggregator');
			});
			describe('constructor', async function () {
				it('sets the aggregator addresses correctly', async function () {
					const repsonse = await fundMe.getPriceFeed();
					assert.equal(repsonse, mockV3Aggregator.address);
				});
			});
			describe('fund', async function () {
				it('fails if not enough ETH was sent', async function () {
					await expect(fundMe.fund()).to.be.revertedWith(
						'You need to send more ETH!'
					);
				});
				it('updates the amount funded data structure', async function () {
					// value is in object because that how BigNumber works in solidity
					await fundMe.fund({ value: sendValue });
					const response = await fundMe.getAddressToAmountFunded(
						deployer
					);
					assert.equal(response.toString(), sendValue.toString());
				});
				it('add funder to array of funders', async function () {
					await fundMe.fund({ value: sendValue });
					const funder = await fundMe.getFunder(0);
					assert.equal(funder, deployer);
				});
			});

			describe('withdraw', async function () {
				beforeEach(async function () {
					await fundMe.fund({ value: sendValue });
				});
				it('withdraw ETH from single funder', async function () {
					// Arrange
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Act
					const txResponse = await fundMe.cheaperWithdraw();
					const txReceipt = await txResponse.wait(1);

					const { gasUsed, effectiveGasPrice } = txReceipt;
					// multiple them together using BigNumber function
					const gasCost = gasUsed.mul(effectiveGasPrice);

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Assert
					assert.equal(endingFundMeBalance, 0);
					// use the solidity BigNumber add function for security
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					);
				});
				it('withdraw ETH from single funder', async function () {
					// Arrange
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Act
					const txResponse = await fundMe.withdraw();
					const txReceipt = await txResponse.wait(1);

					const { gasUsed, effectiveGasPrice } = txReceipt;
					// multiple them together using BigNumber function
					const gasCost = gasUsed.mul(effectiveGasPrice);

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Assert
					assert.equal(endingFundMeBalance, 0);
					// use the solidity BigNumber add function for security
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					);
				});
				it('allows us to withdraw from multiple funders', async function () {
					// Arrange
					const accounts = await ethers.getSigners();
					for (let i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						);
						await fundMeConnectedContract.fund({
							value: sendValue,
						});
					}
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Act
					const txResponse = await fundMe.withdraw();
					const txReceipt = await txResponse.wait(1);
					const { gasUsed, effectiveGasPrice } = txReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);
					// Assert
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					);
					// Make sure funders are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted;
					for (let i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						);
					}
				});
				it('cheaper withdraw testing...', async function () {
					// Arrange
					const accounts = await ethers.getSigners();
					for (let i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						);
						await fundMeConnectedContract.fund({
							value: sendValue,
						});
					}
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Act
					const txResponse = await fundMe.cheaperWithdraw();
					const txReceipt = await txResponse.wait(1);
					const { gasUsed, effectiveGasPrice } = txReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);
					// Assert
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					);
					// Make sure funders are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted;
					for (let i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						);
					}
				});
				it('only allows the owner to withdraw', async function () {
					const accounts = await ethers.getSigners();
					const attacker = accounts[1];
					const attackerConnectedContract = await fundMe.connect(
						attacker
					);
					await expect(attackerConnectedContract.withdraw()).to.be
						.revertedWithCustomError;
				});
			});
	  });
