const { developmentChains } = require("../helper-hardhat-config");
const { ethers } = require("hardhat");

// Costs 0.25 LINK per request.
const BASE_FEE = ethers.utils.parseEther("0.25");
// Calculated value based on the gas price of the chain. Link per gas
const GAS_PRICE_LINK = 1e9;

const DECIMALS = "18";
const INITIAL_PRICE = ethers.utils.parseUnits("200");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("LOCAL: Deploying Mocks...");

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });

    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });

    log("Mocks Deployed");
    log("---------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
