import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { useDisconnect } from 'wagmi'
import { clearConnectionStorage } from '@/lib/wallet'

type Size = 'sm' | 'lg' | 'default'
type Variant = 'default' | 'outline'

export function WalletControls({ size = 'sm', variant = 'default', showDisconnect = false }: { size?: Size, variant?: Variant, showDisconnect?: boolean }) {
    const { disconnect } = useDisconnect()

    const handleDisconnect = () => {
        sessionStorage.setItem('palace-disconnect', 'true')
        clearConnectionStorage()
        disconnect()
    }

    return (
        <div className="flex items-center gap-2">
            {showDisconnect && (
                <Button variant="outline" onClick={handleDisconnect} size={size as any}>
                    Disconnect
                </Button>
            )}
            <ConnectButton.Custom>
                {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
                    const ready = mounted && authenticationStatus !== 'loading'
                    const connected = ready && account && chain

                    if (!connected) {
                        return (
                            <Button onClick={openConnectModal} size={size as any} variant={variant} className="min-w-[140px]">
                                Connect Wallet
                            </Button>
                        )
                    }

                    if (chain?.unsupported) {
                        return (
                            <Button onClick={openChainModal} size={size as any} variant="outline" className="border-burgundy text-burgundy">
                                Wrong Network
                            </Button>
                        )
                    }

                    return (
                        <Button onClick={openAccountModal} size={size as any} variant={variant} className="min-w-[160px]">
                            {account?.displayName}
                        </Button>
                    )
                }}
            </ConnectButton.Custom>
        </div>
    )
}

export default WalletControls


