import React from 'react'
import { Modal, Input, useNotification } from 'web3uikit'
import { useWeb3Contract } from 'react-moralis'
import nftMarketplaceAbi from '../constants/NftMarketplace.json'
import { ethers } from 'ethers'

function UpdateListingModal({ nftAddress, tokenId, isVisable, marketplaceAddress, onClose }) {
	const dispatch = useNotification();

	const [priceToUpdateListingWith, setPriceToUpdateListingWith] = React.useState('');

	const handleUpdateListingSuccess = async (tx) => {
		await tx.wait(1)
		dispatch({
			type: 'success',
			message: 'listing updated',
			title: 'Listing updated - please refresh (and move blocks)',
			position: 'topR'
		})
		onClose && onClose();
		setPriceToUpdateListingWith('0')
	};

	const { runContractFunction: updateListing } = useWeb3Contract({
		abi: nftMarketplaceAbi,
		contractAddress: marketplaceAddress,
		functionName: 'updateListing',
		params: {
			nftAddress,
			tokenId,
			newPrice: ethers.utils.parseEther(priceToUpdateListingWith || 0)
		}
	})

	return (
		<Modal
			isVisable={isVisable}
			onCancel={onClose}
			onCloseButtonPressed={onClose}
			onOk={() => {
				updateListing({
					onError: (error) => console.error(error),
					onSucces: handleUpdateListingSuccess
				});
			}}
		>
			<Input
				label='Update listing price in L1 Currency (ETH)'
				name="New listing price"
				type='number'
				onChange={(event) => {
					setPriceToUpdateListingWith(event.target.value);
				}}
				onOk={() => {

				}}
			/>
		</Modal>
	)
}

export default UpdateListingModal