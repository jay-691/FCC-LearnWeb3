import fs from "fs";
import { network, ethers } from "hardhat";
import { developmentChains, proposalsFile, VOTING_PERIOD } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";

const index = 0;

async function main(proposalIndex: number) {
	const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
	const proposalId = proposals[network.config.chainId!][proposalIndex];

	const voteWay = 1;
	const governor = await ethers.getContract("GovernorContract");
	const reason = "my reason";
	const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason);
	await voteTxResponse.wait(1);

	if (developmentChains.includes(network.name)) {
		await moveBlocks(VOTING_PERIOD + 1);
	}
	console.log("Voted!");
}

main(index)
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});