const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts }) {
  const { deployer } = await getNamedAccounts();

  // Basic Nft
  // ipfs://QmbLwSq2Qi2oddSLTP5dv2wWDjtZBaUM5qqdYkpUUGqxXo
  // 0xD4DC1dBe19b85F1C4ad9D02F4cCc63AA4c39954c
  console.log("Minting Basic NFT...");
  const basicNft = await ethers.getContract("BasicNFT", deployer);
  console.log("Got Basic Contract");
  const basicMintTx = await basicNft.mintNft();
  console.log("Minted Basic NFT!");
  await basicMintTx.wait(1);
  console.log("Basic NFT index 0 has tokenURI:", await basicNft.tokenURI(0));

  // Random IPFS Nft
  // ipfs://bafybeigbhlnkvbn7rguuurpj6i7odu4owadawi6rirycrcmrqze67rkeiy/
  // 0x88B6ed3Ea99c9195B8f45f4c2C4F2e44110639C4
  console.log("Minting Random IPFS NFT...");
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  console.log("Get Contract");
  const mintFee = await randomIpfsNft.getMintFee();
  console.log("After Mint Fee");

  await new Promise(async (resolve, reject) => {
    console.log("Inside Promise");
    setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000);
    randomIpfsNft.once("NftMinted", async function () {
      console.log("Inside Once");
      resolve();
    });
    console.log("After Once");

    const randomIpfsNftMinTx = await randomIpfsNft.requestNft({
      value: mintFee.toString(),
    });
    console.log("After Min Tx");
    const randomIpfsNftMinTxReceipt = await randomIpfsNftMinTx.wait(1);
    console.log("After Min Tx Wait");

    if (developmentChains.includes(network.name)) {
      console.log("Inside If");
      const requestId =
        randomIpfsNftMinTxReceipt.events[1].args.requestId.toString();
      console.log("Request Id", requestId);
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      console.log("After V2 Mock");
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.address
      );
      console.log("After fufillRandom Words");
    }
    setTimeout(() => resolve(), 200000);
  });
  console.log("Outside Promise");
  console.log(
    "Random IPFS NFT index 0 tokenURI:",
    await randomIpfsNft.tokenURI(0)
  );

  // Dynamic SVG NFT
  // 0x688caa39155CebD62102CcAb4618478150d96598
  console.log("Minting Dynamic SVG NFT...");
  const highValue = ethers.utils.parseEther("4000");
  console.log("high value", highValue);
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
  console.log("Got Contract");
  const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString());
  console.log("Minted Dynamic!");
  await dynamicSvgNftMintTx.wait(1);
  console.log("After wait");
  console.log("Dynamic SVG NFT 0 tokenURI:", await dynamicSvgNft.tokenURI(0));
};

module.exports.tags = ["all", "mint"];
