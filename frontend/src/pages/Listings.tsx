import { useEffect, useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract, usePublicClient } from 'wagmi'
import listingAbi from '../abi/ListingManager.json'
import membershipAbi from '../abi/MembershipManager.json'
import bookingAbi from '../abi/BookingManager.json'
import { CONTRACTS } from '../config/contracts'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function Listings() {
    const { address } = useAccount()
    const publicClient = usePublicClient()

    const { data: isMember } = useReadContract({
        address: CONTRACTS.MEMBERSHIP as `0x${string}`,
        abi: membershipAbi as any,
        functionName: 'isMember',
        args: address ? [address] : undefined,
        query: { enabled: Boolean(address && CONTRACTS.MEMBERSHIP) }
    })

    const [listings, setListings] = useState<Array<{ id: bigint, owner: string, pricePerHour: bigint, cid: string, active: boolean }>>([])

    useEffect(() => {
        (async () => {
            if (!publicClient || !CONTRACTS.LISTING) return
            try {
                const nextId = await publicClient.readContract({
                    address: CONTRACTS.LISTING as `0x${string}`,
                    abi: listingAbi as any,
                    functionName: 'nextListingId'
                }) as bigint
                const results: Array<{ id: bigint, owner: string, pricePerHour: bigint, cid: string, active: boolean }> = []
                for (let i = 1n; i < nextId; i++) {
                    const [owner, pricePerHour, metadataCID, active] = await publicClient.readContract({
                        address: CONTRACTS.LISTING as `0x${string}`,
                        abi: listingAbi as any,
                        functionName: 'getListing',
                        args: [i]
                    }) as [string, bigint, string, boolean]
                    if (active) {
                        results.push({ id: i, owner, pricePerHour, cid: metadataCID, active })
                    }
                }
                setListings(results)
            } catch (e) {
                // ignore for now
            }
        })()
    }, [publicClient])

    return (
        <div>
            <h3 className="text-lg font-medium mb-2">Listings</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {listings.map(l => (
                    <ListingCard key={String(l.id)} listing={l} canBook={Boolean(isMember)} />
                ))}
            </div>
        </div>
    )
}

function ListingCard({ listing, canBook }: { listing: { id: bigint, owner: string, pricePerHour: bigint, cid: string }, canBook: boolean }) {
    const [selectedDate, setSelectedDate] = useState<string>(generateDateOptions()[0]?.value || '')
    const publicClient = usePublicClient()
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
    const [availabilityError, setAvailabilityError] = useState<string | null>(null)
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
    const { isLoading: waiting, isSuccess, isError, error: receiptError } = useWaitForTransactionReceipt({ hash })

    const checkAvailability = async () => {
        if (!selectedDate || !publicClient || !CONTRACTS.LISTING) return
        setIsCheckingAvailability(true)
        setAvailabilityError(null)
        try {
            const { startSec, endSec } = getUtcDayRange(selectedDate)
            const isAvail = await publicClient.readContract({
                address: CONTRACTS.LISTING as `0x${string}`,
                abi: listingAbi as any,
                functionName: 'isAvailable',
                args: [listing.id, BigInt(startSec), BigInt(endSec)]
            }) as boolean
            if (!isAvail) {
                setAvailabilityError('This listing is already booked for the selected date.')
            }
        } catch (e) {
            setAvailabilityError('Could not check availability.')
        } finally {
            setIsCheckingAvailability(false)
        }
    }

    useEffect(() => {
        if (selectedDate) {
            checkAvailability()
        }
    }, [selectedDate])

    const onBook = async () => {
        if (!selectedDate) {
            console.log('No date selected')
            return
        }
        try {
            const { startSec, endSec } = getUtcDayRange(selectedDate)
            const duration = BigInt(endSec) - BigInt(startSec)
            if (duration <= 0n) {
                console.log('Invalid duration')
                return
            }

            // Check availability one more time before booking
            if (publicClient && CONTRACTS.LISTING) {
                const isAvail = await publicClient.readContract({
                    address: CONTRACTS.LISTING as `0x${string}`,
                    abi: listingAbi as any,
                    functionName: 'isAvailable',
                    args: [listing.id, BigInt(startSec), BigInt(endSec)]
                }) as boolean
                if (!isAvail) {
                    setAvailabilityError('This listing is no longer available. Please select another date.')
                    return
                }
            }

            const hours = (duration + 3600n - 1n) / 3600n
            const amount = hours * listing.pricePerHour
            console.log('Booking with:', { listingId: listing.id, startSec: startSec.toString(), endSec: endSec.toString(), amount: amount.toString() })
            setAvailabilityError(null)
            writeContract({
                address: CONTRACTS.BOOKING as `0x${string}`,
                abi: bookingAbi as any,
                functionName: 'book',
                args: [listing.id, BigInt(startSec), BigInt(endSec)],
                value: amount
            })
        } catch (e) {
            console.error('Error in onBook:', e)
            setAvailabilityError(String(e))
        }
    }

    const imgSrc = listing.cid ? `https://ipfs.io/ipfs/${listing.cid}` : ''
    const txStatus = isPending ? 'Pending...' : waiting ? 'Confirming...' : isSuccess ? 'Confirmed ✓' : (isError || writeError) ? 'Failed ✗' : null

    return (
        <div className="border rounded-md p-3">
            {imgSrc && (
                <img src={imgSrc} alt="space" className="w-full h-40 object-cover rounded" />
            )}
            <div className="mt-2 text-sm">Listing #{String(listing.id)}</div>
            <div className="text-sm">Price/hour: {listing.pricePerHour.toString()}</div>
            <div className="grid gap-2 mt-2">
                <select className="border rounded-md h-10 px-3 text-sm" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                    {generateDateOptions().map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {isCheckingAvailability && <div className="text-xs text-gray-500">Checking availability...</div>}
                {availabilityError && <div className="text-xs text-red-500">{availabilityError}</div>}
                {canBook ? (
                    <>
                        <Button onClick={onBook} disabled={isPending || waiting || !selectedDate || !!availabilityError}>
                            {isPending ? 'Submitting...' : waiting ? 'Confirming...' : 'Book'}
                        </Button>
                        {!selectedDate && !availabilityError && <div className="text-xs text-red-500">Please select a date</div>}
                    </>
                ) : (
                    <div className="text-xs text-gray-500">Become a member to book.</div>
                )}
            </div>
            {(hash || writeError || receiptError) && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs space-y-1">
                    <div className="font-medium">Transaction Status</div>
                    {hash && <div>Hash: <span className="font-mono">{hash.slice(0, 10)}...{hash.slice(-8)}</span></div>}
                    {txStatus && <div className={isSuccess ? 'text-green-600' : (isError || writeError) ? 'text-red-600' : 'text-gray-600'}>{txStatus}</div>}
                    {(writeError || receiptError) && (
                        <div className="text-red-600 text-xs">
                            Error: {String(writeError?.message || receiptError?.message || writeError || receiptError || 'Unknown error')}
                        </div>
                    )}
                    {isSuccess && <div className="text-green-600 text-xs">Booking confirmed! Check "My Bookings" tab.</div>}
                </div>
            )}
        </div>
    )
}

function generateDateOptions(days: number = 14): Array<{ value: string, label: string }> {
    const opts: Array<{ value: string, label: string }> = []
    const now = new Date()
    for (let i = 0; i < days; i++) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i))
        const value = d.toISOString().slice(0, 10)
        const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })
        opts.push({ value, label })
    }
    return opts
}

function getUtcDayRange(isoDate: string): { startSec: bigint, endSec: bigint } {
    const [y, m, d] = isoDate.split('-').map(Number)
    const startMs = Date.UTC(y, (m - 1), d, 0, 0, 0)
    const endMs = startMs + 24 * 60 * 60 * 1000
    return { startSec: BigInt(Math.floor(startMs / 1000)), endSec: BigInt(Math.floor(endMs / 1000)) }
}


