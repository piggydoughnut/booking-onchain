import { useAccount } from 'wagmi'
import WalletControls from '@/components/wallet/WalletControls'
import Membership from '@/pages/Membership'
import Listings from '@/pages/Listings'
import MyBookings from '@/pages/MyBookings'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function App() {
    const [tab, setTab] = useState<'membership' | 'listings' | 'my'>('membership')
    const { address, isConnected } = useAccount()

    if (isConnected && address) {
        return (
            <div className="container py-8 min-h-screen">
                <div className="victorian-card p-6 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-3xl text-burgundy">The Palace</h2>
                        <div className="flex gap-2 items-center">
                            <WalletControls showDisconnect size="sm" />
                        </div>
                    </div>
                </div>
                <nav className="flex gap-3 my-6 flex-wrap">
                    <Button
                        variant={tab === 'membership' ? 'default' : 'outline'}
                        onClick={() => setTab('membership')}
                        className="min-w-[140px]"
                    >
                        Membership
                    </Button>
                    <Button
                        variant={tab === 'listings' ? 'default' : 'outline'}
                        onClick={() => setTab('listings')}
                        className="min-w-[140px]"
                    >
                        Listings
                    </Button>
                    <Button
                        variant={tab === 'my' ? 'default' : 'outline'}
                        onClick={() => setTab('my')}
                        className="min-w-[140px]"
                    >
                        My Bookings
                    </Button>
                </nav>
                <div className="victorian-card p-8">
                    {tab === 'membership' && <Membership />}
                    {tab === 'listings' && <Listings />}
                    {tab === 'my' && <MyBookings />}
                </div>
            </div>
        )
    }
    return (
        <Wrapper>
            <div className="text-center max-w-2xl victorian-card p-12 mb-8">
                <div className="ornate-divider mb-8"></div>
                <h1 className="text-5xl md:text-6xl mb-4 text-burgundy">Welcome to The Palace</h1>
                <div className="mt-6 flex justify-center">
                    <WalletControls size="lg" />
                </div>
            </div>
        </Wrapper>
    )
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(107, 44, 44, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 50%)'
        }}>
            {children}
        </div>
    )
}