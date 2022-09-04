import React from 'react'
import { Form, useNotification } from 'web3uikit'
import { ethers } from 'ethers'
import nftAbi from '../constants/BasicNft.json'
import nftMarketplaceAbi from '../constants/NftMarketplace.json';
import { useMoralis, useWeb3Contract } from 'react-moralis'
import networkMapping from '../constants/networkMapping.json'

function SellNft() {
	const dispatch = useNotification();
	const { chainId } = useMoralis();
	const chainString = chainId ? parseInt(chainId).toString() : '31337';
	const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];

	const { runContractFunction } = useWeb3Contract();

	async function handleListSuccess() {
		dispatch({
			type: 'success',
			message: 'Item Listed!',
			title: 'Item Listed',
			position: 'topR'
		})
	}

	async function handleApproveSucces(nftAddress, tokenId, price) {
		console.log('Listing...');
		const listOptions = {
			abi: nftMarketplaceAbi,
			contractAddres: marketplaceAddress,
			functionName: 'listItem',
			params: {
				nftAddress,
				tokenId,
				price,
			}
		}

		await runContractFunction({
			params: listOptions,
			onSuccess: () => handleListSuccess(),
			onError: (err) => console.error(err)
		})
	}

	async function approveAndList(data) {
		console.log('Approving...');
		const nftAddress = data.data[0].inputResult;
		const tokenId = data.data[1].inputResult;
		const price = ethers.utils.parseUnits(data.data[2].inputResult, 'ether').toString()

		const approveOptions = {
			abi: nftAbi,
			contractAddress: nftAddress,
			functionName: 'approve',
			params: {
				to: marketplaceAddress,
				tokenId,
			}
		}

		await runContractFunction({
			params: approveOptions,
			onSuccess: () => handleApproveSucces(nftAddress, tokenId, price),
			onError: (err) => console.error(err)
		})
	}

	return (
		<div>
			<Form
				onSubmit={approveAndList}
				data={[
					{
						name: 'NFT Address',
						type: 'text',
						inputWidth: '50%',
						value: '',
						key: 'nftAddress'
					},
					{
						name: 'Token ID',
						type: 'number',
						inputWidth: '50%',
						value: '',
						key: 'tokenId'
					},
					{
						name: 'Price',
						type: 'number',
						inputWidth: '50%',
						value: '',
						key: 'price'
					},
				]}
				title="Sell your NFT!"
				id="MainForm"
			/>
		</div>
	)
}

export default SellNft