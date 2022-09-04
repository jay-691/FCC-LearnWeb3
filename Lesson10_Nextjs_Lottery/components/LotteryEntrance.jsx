import React from 'react'
import { useWeb3Contract, useMoralis } from 'react-moralis'
import { abi, contractAddresses } from '../constants'
import { ethers } from 'ethers';
import { useNotification } from 'web3uikit'

function LotteryEntrance() {
	const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
	const chainId = parseInt(chainIdHex);
	const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

	const dispatch = useNotification();

	const [entranceFee, setEntranceFee] = React.useState(0);
	const [numPlayers, setNumPlayers] = React.useState(0);
	const [recentWinner, setRecentWinner] = React.useState(0);

	const { runContractFunction: enterLottery, isLoading, isFetching } = useWeb3Contract({
		abi,
		contractAddress: lotteryAddress, // specify the network id
		functionName: 'enterLottery',
		params: {},
		msgValue: entranceFee
	})
	const { runContractFunction: getEntranceFee } = useWeb3Contract({
		abi,
		contractAddress: lotteryAddress, // specify the network id
		functionName: 'getEntranceFee',
		params: {},
	})
	const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
		abi,
		contractAddress: lotteryAddress, // specify the network id
		functionName: 'getNumberOfPlayers',
		params: {},
	})
	const { runContractFunction: getRecentWinner } = useWeb3Contract({
		abi,
		contractAddress: lotteryAddress, // specify the network id
		functionName: 'getRecentWinner',
		params: {},
	})

	async function updateUi() {
		const entraceFeeFromContract = await getEntranceFee();
		setEntranceFee(entraceFeeFromContract?.toString());
		const numPlayersFromContract = await getNumberOfPlayers();
		setNumPlayers(numPlayersFromContract?.toString());
		const recentWinnerFromContract = await getRecentWinner();
		setRecentWinner(recentWinnerFromContract);
	}

	React.useEffect(() => {
		if (isWeb3Enabled) {
			updateUi()
		}
	}, [isWeb3Enabled])

	const handleNewNotification = () => {
		dispatch({
			type: 'info',
			message: 'Transaction Complete',
			title: 'Tx Notification',
			position: 'topR',
			icon: 'bell'
		})
	}

	const handleSuccess = async (tx) => {
		await tx.wait(1);
		handleNewNotification(tx);
		updateUi();
	}

	return (
		<div className='p-5'>
			{lotteryAddress ? (
				<div>
					<button
						className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
						onClick={async () => {
							// checks to see if it was sent to metamask, not that tx was successful
							await enterLottery({
								onSuccess: handleSuccess,
								onError: (error) => console.error(error)
							});
						}}
						disabled={isLoading || isFetching}
					>
						{isFetching || isLoading ? <div className='animate-spin spinner-border h-8 w-8 border-b-2 rounded-full'></div> : <span>Enter Lottery</span>}
					</button>
					<div>
						Entrance Fee: {ethers.utils.formatUnits(entranceFee, 'ether').toString()} ETH
					</div>
					<div>
						Number of Players: {numPlayers}
					</div>
					<div>
						Recent Winner: {recentWinner}
					</div>
				</div>
			) : (
				<div>
					No Lottery Address Detected
				</div>
			)}
		</div>
	)
}

export default LotteryEntrance