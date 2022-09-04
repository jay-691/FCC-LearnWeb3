const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/uploadToPinata");

const imagesLocation = "./assets/random";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Small",
      value: 100,
    },
  ],
};

async function handleTokenUris() {
  tokenUris = [];

  // store image in IPFS :tick:
  // store metadata in IPFS
  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  for (imageUploadResponseIndex in imageUploadResponses) {
    // create metadata
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `A cute ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log("Uploading", tokenUriMetadata.name, "...");
    // upload metadata
    const metadataUploadResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs Uploaded:");
  console.log(tokenUris);
  return tokenUris;
}

const tokenUris = [
  "ipfs://QmbLwSq2Qi2oddSLTP5dv2wWDjtZBaUM5qqdYkpUUGqxXo",
  "ipfs://QmRZQNZuDN6WwWBPS3Cq3vta7dahd9RJYn3cBv7XWiomRP",
  "ipfs://QmeCwWURTkqGb2bNR7585YiTk5xJJ2CiiAp8tpxV5UQnLh",
];

const FUND_AMOUNT = "10000000000000000";

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // get the ipfs hashes of our images
  // Ways for ipfs to host images
  // 1. Own IPFS node. - This is technically centralized
  // 2. Pinata - Gotta pay. Also centralized
  // 3. NFT Storage - Use filecoin but a bit more complicated but better
  // Check FCC repo for nft.storage script

  if (process.env.UPLOAD_TO_PINATA == "true") {
    console.log("TRUE");
    tokenUris = await handleTokenUris();
  }

  let vrfCoordinatorV2Address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  log("-------------------------------");
  const gasLane = networkConfig[chainId]["gasLane"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const mintFee = networkConfig[chainId]["mintFee"];

  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    gasLane,
    callbackGasLimit,
    tokenUris,
    mintFee,
  ];
  // await storeImages(imagesLocation);
  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(randomIpfsNft.address, args);
  }
  log("-------------------------------");
};

module.exports.tags = ["all", "randomipfs", "main"];
