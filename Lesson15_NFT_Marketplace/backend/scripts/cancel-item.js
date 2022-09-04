const { network, ethers } = require("hardhat");
const { moveBlocks, sleep } = require("../utils/move-blocks");

const TOKEN_ID = 1;

async function cancelItem() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNft");

    const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID);
    await tx.wait(1);

    console.log("Nft Canceled");

    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000));
    }
}

cancelItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
