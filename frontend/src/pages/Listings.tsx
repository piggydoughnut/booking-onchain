import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useListings, useListingAvailability, useEnsureListingAvailability } from '@/hooks/useListing'
import { todayIsoUTC, getUtcDayRange } from '@/lib/utils'
import { useMembershipStatus } from '@/hooks/useMembership'
import { useBookListing } from '@/hooks/useBooking'

import BurgundyBox from '@/components/ui/burgundy-box'

export default function Listings() {
    const { address } = useAccount()
    const { listings } = useListings()
    const { data: isMember } = useMembershipStatus(address)

    return (
        <div className="space-y-6">
            <div className="ornate-divider"></div>
            <h3 className="text-3xl text-burgundy mb-6">Available Spaces</h3>
            {listings.length === 0 ? (
                <div className="victorian-card p-8 text-center">
                    <p className="text-foreground/70 italic">No listings available at this time.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(l => (
                        <ListingCard key={String(l.id)} listing={l} canBook={Boolean(isMember)} />
                    ))}
                </div>
            )}
            <div className="ornate-divider mt-8"></div>
        </div>
    )
}

function ListingCard({ listing, canBook }: { listing: { id: bigint, owner: string, pricePerHour: bigint, cid: string }, canBook: boolean }) {
    const [selectedDate, setSelectedDate] = useState<string>(todayIsoUTC())
    const [availabilityError, setAvailabilityError] = useState<string | null>(null)

    const { startSec, endSec } = selectedDate ? getUtcDayRange(selectedDate) : { startSec: undefined, endSec: undefined }
    const { data: isAvailable } = useListingAvailability(listing.id, startSec, endSec)
    const { ensureAvailable } = useEnsureListingAvailability(listing.id)
    const { bookListing, hash, isPending, waiting, isSuccess, isError, error } = useBookListing()

    const onBook = async () => {
        if (!selectedDate || !startSec || !endSec) {
            console.log('No date selected')
            return
        }
        try {

            const isAvail = await ensureAvailable(BigInt(startSec), BigInt(endSec))
            if (!isAvail) {
                throw new Error('Listing is no longer available. Please select another date.')
            }


            console.log('Booking with:', { listingId: listing.id, startSec: startSec.toString(), endSec: endSec.toString() })
            setAvailabilityError(null)
            bookListing(listing.id, BigInt(startSec), BigInt(endSec))
        } catch (e) {
            console.error('Error in onBook:', e)
            setAvailabilityError(String(e))
        }
    }

    useEffect(() => {
        if (selectedDate && isAvailable === false) {
            setAvailabilityError('This listing is already booked for the selected date.')
        } else if (isAvailable === true) {
            setAvailabilityError(null)
        }
    }, [selectedDate, isAvailable])

    const imgSrc = listing.cid ? `https://ipfs.io/ipfs/${listing.cid}` : ''
    const txStatus = isPending ? 'Pending...' : waiting ? 'Confirming...' : isSuccess ? 'Confirmed ✓' : (isError || error) ? 'Failed ✗' : null

    return (
        <div className="victorian-card p-4">
            {imgSrc && (
                <img src={imgSrc} alt="space" className="w-full h-48 object-cover rounded-sm border-2 border-burgundy mb-4" />
            )}
            <div className="space-y-3">
                <div>
                    <p className="text-xs text-foreground/60 mb-1">Room</p>
                    <p className="text-lg font-semibold text-burgundy">Listing #{String(listing.id)}</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-foreground/70 font-semibold">Select Date</label>
                    <input
                        type="date"
                        className="w-full border-2 border-burgundy bg-cream text-foreground rounded-sm h-11 px-3 text-sm font-serif focus:ring-2 focus:ring-gold focus:border-gold"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    {availabilityError && (
                        <div className="p-2 bg-red-50 border border-red-600 rounded-sm">
                            <p className="text-xs text-red-800 font-semibold">{availabilityError}</p>
                        </div>
                    )}
                    {canBook ? (
                        <>
                            <Button
                                onClick={onBook}
                                disabled={isPending || waiting || !selectedDate || !!availabilityError}
                                className="w-full mt-2"
                            >
                                {isPending ? 'Submitting...' : waiting ? 'Confirming...' : 'Book'}
                            </Button>
                            {!selectedDate && !availabilityError && (
                                <p className="text-xs text-burgundy-dark">Please select a date</p>
                            )}
                        </>
                    ) : (
                        <BurgundyBox className="p-3 text-center">
                            <p className="text-xs text-foreground/70 italic">Membership required to book</p>
                        </BurgundyBox>
                    )}
                </div>
                {(Boolean(hash) || Boolean(error)) && (
                    <BurgundyBox className="mt-4 p-3 space-y-2">
                        <p className="font-semibold text-sm text-foreground">Transaction Status</p>
                        {hash && (
                            <p className="text-xs text-foreground/70">
                                Hash: <span className="font-mono text-foreground">{hash.slice(0, 10)}...{hash.slice(-8)}</span>
                            </p>
                        )}
                        {txStatus && (
                            <p className={`text-sm font-semibold ${isSuccess ? 'text-secondary-dark' : (isError || error) ? 'text-red-800' : 'text-foreground/70'}`}>
                                {txStatus}
                            </p>
                        )}
                        {!!error && (
                            <div className="p-2 bg-red-50 border border-red-600 rounded-sm">
                                <p className="text-xs text-red-800">
                                    Error: {String((error as { message?: string })?.message ?? error ?? 'Unknown error')}
                                </p>
                            </div>
                        )}
                        {isSuccess && (
                            <p className="text-sm text-secondary-dark font-semibold">✓ Booking confirmed! Check "My Bookings" tab.</p>
                        )}
                    </BurgundyBox>
                )}
            </div>
        </div>
    )
}




