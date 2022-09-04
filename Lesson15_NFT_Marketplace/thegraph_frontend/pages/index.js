import React from "react";
import { useMoralis } from "react-moralis";
import NftCard from "../components/NftCard";
import networkMapping from "../constants/networkMapping.json";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";
import { useQuery } from "@apollo/client";

export default function Home() {
  // Index events off chain and then read from database
  // Start-up server to listen for those events to be fired
  // we will then add them to the database for website to query

  // That sounds centralized.
  // Moralis is centralized
  // TheGraph is de-centralized

  const { isWeb3Enabled, chainId } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];

  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

  return (
    <div className="container mx-auto">
      <main>
        <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
        <div className="flex flex-wrap">
          {isWeb3Enabled ? (
            loading || !listedNfts ? (
              <div>Loading...</div>
            ) : (
              listedNfts.activeItems.map((nft) => {
                console.log(nft);
                const { price, nftAddress, tokenId, seller } = nft;
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
