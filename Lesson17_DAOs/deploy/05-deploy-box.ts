import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	// @ts-ignore
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	log("Deploying Box...");
	const args = [];
	const box = await deploy("Box", {
		from: deployer,
		args,
		log: true,
	});
	const timelock = await ethers.getContract("TimeLock");
	const boxContract = await ethers.getContractAt("Box", box.address);
	const transferOwnerTx = await boxContract.transferOwnership(
		timelock.address
	);
	await transferOwnerTx.wait(1);
	log("Ownership Transfered");
};

export default deployBox;