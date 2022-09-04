import React from "react";
import styles from "../styles/Home.module.css";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NftCard from "../components/NftCard";

export default function Home() {
  // Index events off chain and then read from database
  // Start-up server to listen for those events to be fired
  // we will then add them to the database for website to query

  // That sounds centralized.
  // Moralis is centralized
  // TheGraph is de-centralized

  const { isWeb3Enabled } = useMoralis();

  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    // TableName
    // Function for the query
    "ActiveItem",
    (query) => query.limit(10).descending("tokenId")
  );
  console.log(listedNfts);

  React.useEffect(() => {}, []);

  return (
    <div className="container mx-auto">
      <main>
        <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
        <div className="flex flex-wrap">
          {isWeb3Enabled ? (
            fetchingListedNfts ? (
              <div>Loading...</div>
            ) : (
              listedNfts.map((nft) => {
                console.log(nft.attributes);
                const {
                  price,
                  nftAddress,
                  tokenId,
                  marketplaceAddress,
                  seller,
                } = nft.attributes;
                return (
                  <div>
                    <p>Price: {price}</p>
                    <p>NFT Address: {nftAddress}</p>
                    <p>Token ID: {tokenId}</p>
                    <p>Seller: {seller}</p>
                    <NftCard
                      price={price}
                      nftAddress={nftAddress}
                      tokenId={tokenId}
                      seller={seller}
                      marketplaceAddress={marketplaceAddress}
                      key={`${nftAddress}-${tokenId}`}
                    />
                  </div>
                );
              })
            )
          ) : (
            <div>Web3 Not Enabled</div>
          )}
        </div>
      </main>
    </div>
  );
}
