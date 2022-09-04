const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Tests", () => {
          let nftMarketplace, basicNft, deployer, player;
          const PRICE = ethers.utils.parseEther("0.1");
          const TOKEN_ID = 0;

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              //   player = (await getNamedAccounts()).player;
              const accounts = await ethers.getSingers();
              player = accounts[1];
              await deployments.fixture(["all"]);
              // Get contract automatically connects to the deployer as that is
              // what is account 0
              nftMarketplace = await ethers.getContract("NftMarketplace");
              // nftMarketplace = await nftMarketplace.connect(player);
              basicNft = await ethers.getContract("BasicNft");
              // deployer Minting NFT
              await basicNft.mintNft();
              // deployer approving to send it to marketplace
              await basicNft.approve(nftMarketplace.address, TOKEN_ID);
              // only than can the marketplace call transferFrom
          });

          it("lists nd can be bought", async () => {
              await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);

              const playerConnectedNftMarketplace = nftMarketplace.connect(player);
              await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                  value: PRICE,
              });

              const newOwer = await basicNft.ownerOf(TOKEN_ID);
              assert(newOwer.toString() == player.address);

              const deployerProceeds = await nftMarketplace.getProceeds(deployer);
              assert(deployerProceeds.toString() == PRICE.toString());
          });
      });
