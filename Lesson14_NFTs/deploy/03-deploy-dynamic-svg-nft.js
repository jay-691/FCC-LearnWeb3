const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId;
  let ethUsdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");
    ethUsdPriceFeedAddress = EthUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const lowSvg = await fs.readFileSync("./assets/dynamic/frown.svg", {
    encoding: "utf8",
  });
  const highSvg = await fs.readFileSync("./assets/dynamic/happy.svg", {
    encoding: "utf8",
  });

  log("-------------------------------");
  const args = [ethUsdPriceFeedAddress, lowSvg, highSvg];
  const dynamicSvgNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfimations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(dynamicSvgNft.address, args);
  }
  log("-------------------------------");
};

module.exports.tags = ["all", "dynamic", "main"];
