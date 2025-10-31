import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiConfig, createConfig, http } from 'wagmi'
import { RainbowKitProvider, lightTheme, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@rainbow-me/rainbowkit/styles.css'
import '@/index.css'
import App from '@/pages/App'

const localhost = {
    id: 31337,
    name: 'Hardhat Local',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: [import.meta.env.VITE_RPC || 'http://127.0.0.1:8545'] },
        public: { http: [import.meta.env.VITE_RPC || 'http://127.0.0.1:8545'] }
    }
} as const

const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [injectedWallet]
    }
], {
    appName: 'Palace',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'noop'
})

import type { Chain } from 'viem/chains'

const config = createConfig({
    chains: [localhost as unknown as Chain],
    transports: {
        [localhost.id]: http(import.meta.env.VITE_RPC || 'http://127.0.0.1:8545')
    },
    connectors
})

const queryClient = new QueryClient()

const victorianTheme = lightTheme({
    accentColor: '#6b2c2c', // burgundy
    accentColorForeground: '#f5f0e6', // cream
    borderRadius: 'small',
    overlayBlur: 'small'
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <WagmiConfig config={config}>
                <RainbowKitProvider theme={victorianTheme} modalSize="compact">
                    <App />
                </RainbowKitProvider>
            </WagmiConfig>
        </QueryClientProvider>
    </React.StrictMode>
)


