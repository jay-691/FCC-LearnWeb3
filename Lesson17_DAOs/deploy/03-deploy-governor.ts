import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE } from "../helper-hardhat-config";

const deployGovernor: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	// @ts-ignore
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log, get } = deployments;
	const { deployer } = await getNamedAccounts();
	const governanceToken = await get("GovernanceToken");
	const timelock = await get("TimeLock");

	log("Deploying Governor...");
	const args = [
		governanceToken.address,
		timelock.address,
		VOTING_DELAY,
		VOTING_PERIOD,
		QUORUM_PERCENTAGE
	];
	const governorContract = await deploy("GovernorContract", {
		from: deployer,
		args,
		log: true,
	});
	log(`Deployed GovernorContract to address ${governorContract.address}`);
};

export default deployGovernor;