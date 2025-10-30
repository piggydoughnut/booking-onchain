import { ConnectButton } from '@rainbow-me/rainbowkit'
import Membership from './Membership'
import Listings from './Listings'
import MyBookings from './MyBookings'
import { useState } from 'react'
import { Button } from '../components/ui/button'

export default function App() {
    const [tab, setTab] = useState<'membership' | 'listings' | 'my'>('membership')
    return (
        <div className="container py-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Booking Onchain</h2>
                <ConnectButton />
            </div>
            <nav className="flex gap-2 my-4">
                <Button variant={tab === 'membership' ? 'default' : 'secondary'} onClick={() => setTab('membership')}>Membership</Button>
                <Button variant={tab === 'listings' ? 'default' : 'secondary'} onClick={() => setTab('listings')}>Listings</Button>
                <Button variant={tab === 'my' ? 'default' : 'secondary'} onClick={() => setTab('my')}>My Bookings</Button>
            </nav>
            {tab === 'membership' && <Membership />}
            {tab === 'listings' && <Listings />}
            {tab === 'my' && <MyBookings />}
        </div>
    )
}


