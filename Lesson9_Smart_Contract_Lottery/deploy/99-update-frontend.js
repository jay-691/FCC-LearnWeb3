// From Lesson 10
const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

const FRONTEND_ADDRESS_FILE = path.join(
    "../Lesson10_Nextjs_Lottery/fcc-lottery/constants/contractAddresses.json"
);
const FRONTEND_ABI_FILE = "../Lesson10_Nextjs_Lottery/fcc-lottery/constants/abi.json";

module.exports = async function () {
    if (process.env.UPDATE_FRONTEND) {
        console.log("Updaing frontend...");
        updateContractAddresses();
        updateAbi();
    }
};

async function updateAbi() {
    const lottery = await ethers.getContract("Lottery");
    fs.writeFileSync(FRONTEND_ABI_FILE, lottery.interface.format(ethers.utils.FormatTypes.json));
}

async function updateContractAddresses() {
    const lottery = await ethers.getContract("Lottery");
    const contractAddress = JSON.parse(fs.readFileSync(FRONTEND_ADDRESS_FILE, "utf8"));
    const chainId = network.config.chainId.toString();
    if (chainId in contractAddress) {
        if (!contractAddress[chainId].includes(lottery.address)) {
            contractAddress[chainId].push(lottery.address);
        }
    } else {
        contractAddress[chainId] = [lottery.address];
    }
    fs.writeFileSync(FRONTEND_ADDRESS_FILE, JSON.stringify(contractAddress));
}

module.exports.tags = ["all", "frontend"];
