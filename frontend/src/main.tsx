import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiConfig, createConfig, http } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { injected } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import App from './pages/App'
import { http as viemHttp } from 'viem'

const localhost = {
    id: 31337,
    name: 'Hardhat Local',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: [import.meta.env.VITE_RPC || 'http://127.0.0.1:8545'] },
        public: { http: [import.meta.env.VITE_RPC || 'http://127.0.0.1:8545'] }
    }
} as const

const config = createConfig({
    chains: [localhost as any],
    transports: {
        [localhost.id]: http(import.meta.env.VITE_RPC || 'http://127.0.0.1:8545')
    },
    connectors: [injected()]
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <WagmiConfig config={config}>
                <RainbowKitProvider>
                    <App />
                </RainbowKitProvider>
            </WagmiConfig>
        </QueryClientProvider>
    </React.StrictMode>
)


