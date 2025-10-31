import { useMyBookings } from '@/hooks/useBooking'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import ErrorBox from '@/components/ui/error-box'
import { formatAmount, formatUtcDateFromSeconds, formatUtcTimeRangeFromSeconds } from '@/lib/utils'

export default function MyBookings() {
    const { address } = useAccount()
    const { bookings, loading, error, refetch } = useMyBookings()

    return (
        <div className="space-y-6">
            <div className="ornate-divider"></div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-3xl text-burgundy">My Bookings</h3>
                <Button onClick={refetch} disabled={loading} variant="outline" size="sm">
                    {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>
            {loading && (
                <div className="p-4 bg-cream-dark border border-burgundy rounded-sm">
                    <p className="text-foreground/70 italic">Loading bookings...</p>
                </div>
            )}
            {error && (
                <ErrorBox title="Error">{String(error)}</ErrorBox>
            )}
            {address && (
                <div className="p-3 bg-cream-dark border border-burgundy rounded-sm">
                    <p className="text-xs text-foreground/60">
                        Bookings for: <span className="font-mono text-foreground">{address.slice(0, 10)}...{address.slice(-8)}</span>
                    </p>
                </div>
            )}
            {bookings.length === 0 && !loading ? (
                <div className="victorian-card p-8 text-center">
                    <p className="text-foreground/70 italic mb-2">
                        No bookings yet.
                    </p>
                    <p className="text-sm text-foreground/60">
                        {address ? 'Make a booking on the Listings tab.' : 'Connect your wallet first.'}
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map(b => (
                        <div key={String(b.id)} className="victorian-card p-4">
                            {b.cid && (
                                <img
                                    src={`https://ipfs.io/ipfs/${b.cid}`}
                                    className="w-full h-48 object-cover rounded-sm border-2 border-burgundy mb-4"
                                    alt="Booking space"
                                />
                            )}
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-foreground/60 mb-1">Booking</p>
                                    <p className="text-lg font-semibold text-burgundy">#{String(b.id)}</p>
                                    <p className="text-sm text-foreground/70">Room #{String(b.listingId)}</p>
                                </div>
                                <div className="p-3 bg-cream-dark border border-gold rounded-sm">
                                    <p className="text-xs text-foreground/60 mb-1">Date</p>
                                    <p className="text-sm font-semibold text-foreground">{formatUtcDateFromSeconds(b.startTs)}</p>
                                </div>
                                <div className="p-3 bg-cream-dark border border-burgundy rounded-sm">
                                    <p className="text-xs text-foreground/60 mb-1">Amount Paid</p>
                                    <p className="text-base font-semibold text-foreground">{formatAmount(b.amount)} PAS</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="ornate-divider mt-8"></div>
        </div>
    )
}




