// Create new table called "ActiveItem"
// It will:
//  - Add items when listed
//  - Remove iem when bought or canceled

// Dont need imports as this is going straight to Moralis
Moralis.Cloud.afterSave("ItemListed", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  logger.info("Looking for confirmed Tx");

  const confirmed = request.object.get("confirmed");
  if (confirmed) {
    logger.info("Found Item");

    const ActiveItem = Moralis.Object.extend("ActiveItem");

    // Check to see if item is already listed
    const query = new Moralis.Query(ActiveItem);
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));
    query.equalTo(
      "marketplaceAddress",
      request.object.get("marketplaceAddress")
    );
    query.equalTo("seller", request.object.get("seller"));

    const alreadyListedItem = await query.first();
    if (alreadyListedItem) {
      logger.info(`Deleting already listed ${request.object.get("objectId")}`);
      await alreadyListedItem.destroy();
      logger.info(
        `Deleted item with TokenId: ${request.object.get(
          "tokenId"
        )} at Address: ${request.object.get("address")}`
      );
    }

    const activeItem = new ActiveItem();

    activeItem.set("marketplaceAddress", request.object.get("address"));
    activeItem.set("nftAddress", request.object.get("nftAddress"));
    activeItem.set("price", request.object.get("price"));
    activeItem.set("tokenId", request.object.get("tokenId"));
    activeItem.set("seller", request.object.get("seller"));

    logger.info(
      `Adding Address: ${request.object.get(
        "address"
      )}, TokenId: ${request.object.get("tokenId")}`
    );
    logger.info("Saving...");
    await activeItem.save();
    logger.info("Saved");
  }
});

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();

  logger.info(`Marketplace | Object: ${request.object}`);

  if (confirmed) {
    const ActiveItem = Moralis.Object.extend("ActiveItem");
    const query = new Moralis.Query(ActiveItem);

    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));

    logger.info(`Marketplace | Query: ${query}`);

    // Find first canceled item from the query
    const canceledItem = await query.first();

    logger.info(`Marketplace | CanceledItem: ${canceledItem}`);

    if (canceledItem) {
      logger.info(
        `Deleting ${request.object.get(
          "tokenId"
        )} at Address: ${request.object.get("address")} since it was canceled.`
      );

      // this removes it from ActiveItem table
      await canceledItem.destroy();
    } else {
      logger.info(
        `No item found with address ${request.object.get(
          "address"
        )} and TokenId: ${request.object.get("address")}`
      );
    }
  }
});

Moralis.Cloud.afterSave("ItemBought", async () => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();

  if (confirmed) {
    const ActiveItem = Moralis.Object.extend("ActiveItem");
    const query = new Moralis.Query(ActiveItem);

    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));

    logger.info(`Marketplace | Query: ${query}`);

    const boughtItem = await query.first();
    if (boughtItem) {
      logger.info(`Deleting ${request.object.get("objectId")}.`);

      // this removes it from ActiveItem table
      await canceledItem.destroy();

      logger.info(
        `Deleted ${request.object.get(
          "tokenId"
        )} at Address: ${request.object.get("address")}.`
      );
    } else {
      logger.info(
        `No item found with address: ${request.object.get(
          "address"
        )} and TokenId: ${request.object.get("address")}`
      );
    }
  }
});
