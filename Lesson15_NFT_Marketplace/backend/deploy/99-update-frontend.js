const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

const frontendContractsFile = "../moralis_frontend/constants/networkMapping.json";
const frontendAbiLocation = "../moralis_frontend/constants";

async function updateContractAddresses() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const chainId = network.config.chainId.toString();
    const contractAddresses = JSON.parse(fs.readFileSync(frontendContractsFile, "utf8"));
    if (chainId in contractAddresses) {
        // if the marketplace doesnt include the contract address then add it
        // which would be the deployer
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address);
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] };
    }
    fs.writeFileSync(frontendContractsFile, JSON.stringify(contractAddresses));
}

async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");

    fs.writeFileSync(
        `${frontendAbiLocation}/NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    );

    const basicNft = await ethers.getContract("BasicNft");
    fs.writeFileSync(
        `${frontendAbiLocation}/BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    );
}

module.exports = async function () {
    if (process.env.UPDATE_FRONTEND) {
        console.log("Updating Frontend...");
        await updateContractAddresses();
        await updateAbi();
    }
};

module.exports.tags = ["all", "frontend"];
