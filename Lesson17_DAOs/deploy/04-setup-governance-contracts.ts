import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE, ADDRESS_ZERO } from "../helper-hardhat-config";

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	// @ts-ignore
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log, get } = deployments;
	const { deployer } = await getNamedAccounts();
	// const governanceToken = await get("GovernanceToken");
	// const timelock = await get("TimeLock");
	const timelock = await ethers.getContract("TimeLock", deployer);
	const governor = await ethers.getContract("GovernorContract", deployer);

	log("Setting up roles...");
	const proposerRole = await timelock.PROPOSER_ROLE();
	const executorRole = await timelock.EXECUTOR_ROLE();
	const adminRole = await timelock.TIMELOCK_ADMIN_ROLE();

	const proposerTx = await timelock.grantRole(proposerRole, governor.address);
	await proposerTx.wait(1);

	const executorTx = await timelock.grantRole(executorRole, ADDRESS_ZERO);
	await executorTx.wait(1);

	const revokeTx = await timelock.revokeRole(adminRole, deployer);
	await revokeTx.wait(1);
};

export default setupContracts;