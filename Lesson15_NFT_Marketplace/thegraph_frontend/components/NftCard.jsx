import React from 'react'
import { useWeb3Contract, useMoralis } from 'react-moralis';
import nftMarketplaceAbi from '../constants/NftMarketplace.json';
import nftAbi from '../constants/BasicNft.json'
import Image from 'next/image'
import { Card, useNotification } from 'web3uikit'
import { ethers } from 'ethers'
import UpdateListingModal from './UpdateListingModal';

function truncateStr(fullStr, strLength) {
	if (fullStr.length <= strLength) return fullStr;
	const seperator = '...';
	const seperatorLength = seperator.length;
	const charsToShow = strLength - seperatorLength;
	const frontChars = Math.ceil(charsToShow / 2);
	const backChars = Math.floor(charsToShow / 2);
	return fullStr.substring(0, frontChars) + seperator + fullStr.substring(fullStr.length - backChars);
}

function NftCard({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
	const { isWeb3Enabled, account } = useMoralis();
	const [imageUri, setImageUri] = React.useState("");
	const [tokenName, setTokenName] = React.useState("");
	const [tokenDescription, setTokenDescription] = React.useState("");
	const [ownedBy, setOwnedBy] = React.useState("");
	const [showModal, setShowModal] = React.useState(false)
	const hideModal = () => setShowModal(false)
	const dispatch = useNotification()

	const { runContractFunction: getTokenURI } = useWeb3Contract({
		abi: nftAbi,
		contractAddress: nftAddress,
		functionName: 'tokenURI',
		params: {
			tokenId
		}
	})

	const { runContractFunction: buyItem } = useWeb3Contract({
		abi: nftMarketplaceAbi,
		contractAddress: marketplaceAddress,
		functionName: 'buyItem',
		msgValue: price,
		params: {
			nftAddress,
			tokenId
		}
	})

	async function updateUI() {
		const tokenURI = await getTokenURI();
		console.log('Token URI:', tokenURI);

		if (tokenURI) {
			// IPFS Gateway: A server that will retern IPFS files from a normal URL.
			const requestUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
			const tokenURIResponse = await (await fetch(requestUrl)).json();
			const imageURI = tokenURIResponse.image;
			const imageURIURL = imageURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
			setImageUri(imageURIURL);
			setTokenName(tokenURIResponse.name);
			setTokenDescription(tokenURIResponse.description);
			// Better ways:
			// We could render image on server and then call moralis server
			// For testnets & mainnet, use moralis server hooks
		}
	}

	React.useEffect(() => {
		if (isWeb3Enabled) {
			updateUI();
		}
		const isOwnedByUser = seller === account || seller == null;
		const formattedSellerAddress = isOwnedByUser ? 'you' : truncateStr(seller || '', 13);
		setOwnedBy(formattedSellerAddress)
	}, [isWeb3Enabled, seller, account]);

	const handleBuyItemSuccess = async (tx) => {
		await tx.wait(1);
		dispatch({
			type: 'success',
			message: 'Item bought!',
			title: 'Item Bought',
			position: 'topR'
		})
	}

	const handleCardClick = () => {
		isOwnedByUser
			? setShowModal(true)
			: buyItem({
				onError: (err) => console.error(err),
				onSuccess: handleBuyItemSuccess
			});
	}

	return (
		<div>
			<UpdateListingModal
				onClose={hideModal}
				tokenId={tokenId}
				marketplaceAddress={marketplaceAddress}
				nftAddress={nftAddress}
				isVisable={showModal}
			/>
			<Card title={tokenName} description={tokenDescription} onClick={handleCardClick}>
				<div className='flex flex-col items-end gap-2'>
					<div>#{tokenId}</div>
					<div className="italic text-sm">Owned by {ownedBy}</div>
					{imageUri ? (
						<Image
							loader={() => imageUri}
							src={imageUri}
							height="200"
							width="200"
						/>
					) : (<p>Loading...</p>)}
					<div className='font-bold'>{ethers.utils.formatUnits(price, 'ether')} ETH</div>
				</div>
			</Card>
		</div>
	)
}

export default NftCard