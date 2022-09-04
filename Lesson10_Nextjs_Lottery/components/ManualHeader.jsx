import React from 'react'
import { useMoralis } from 'react-moralis'

function ManualHeader() {
	const { enableWeb3, isWeb3Enabled, isWeb3EnabledLoading, account, Moralis, deactivateWeb3 } = useMoralis();

	React.useEffect(() => {
		if (isWeb3Enabled) return;
		if (typeof window !== 'undefined') {
			if (window.localStorage.getItem('connected')) {
				enableWeb3()
			}
		}
	}, [isWeb3Enabled])

	React.useEffect(() => {
		Moralis.onAccountChanged((newAccount) => {
			console.log('Account changed to', newAccount)
			if (account == null) {
				window.localStorage.removeItem('connected')
				deactivateWeb3()
				console.log('Null account found')
			}
		})
	}, [])


	return (
		<div>
			{account ? (
				<div style={{ backgroundColor: '#555', color: 'whitesmoke', borderRadius: 10, padding: '1rem' }}>
					{account.slice(0, 5)}
					...
					{account.slice(account.length - 4)}
				</div>
			) : (
				<button
					onClick={async () => {
						await enableWeb3()
						if (typeof window !== 'undefined') {
							window.localStorage.setItem('connected', 'injected')
						}
					}}
					disabled={isWeb3EnabledLoading}
				>
					Connect
				</button>
			)}
		</div>
	)
}

export default ManualHeader