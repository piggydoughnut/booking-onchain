import { useAccount, usePublicClient } from 'wagmi'
import { useEffect, useMemo, useRef, useState } from 'react'
import bookingAbi from '../abi/BookingManager.json'
import listingAbi from '../abi/ListingManager.json'
import { CONTRACTS } from '../config/contracts'

type Booking = { id: bigint, listingId: bigint, startTs: bigint, endTs: bigint, amount: bigint, released: boolean }

export default function MyBookings() {
    const { address } = useAccount()
    const publicClient = usePublicClient()
    const [bookings, setBookings] = useState<Array<Booking & { cid: string, pricePerHour: bigint }>>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const loadingRef = useRef(false)

    const load = async () => {
        if (!address || !publicClient || !CONTRACTS.BOOKING || !CONTRACTS.LISTING) {
            console.log('Missing dependencies:', { address, publicClient: !!publicClient, booking: CONTRACTS.BOOKING, listing: CONTRACTS.LISTING })
            return
        }
        if (loadingRef.current) return
        loadingRef.current = true
        setLoading(true)
        setError(null)
        try {
            console.log('Loading bookings for:', address)
            const nextId = await publicClient.readContract({
                address: CONTRACTS.BOOKING as `0x${string}`,
                abi: bookingAbi as any,
                functionName: 'nextBookingId'
            }) as bigint
            console.log('nextBookingId:', nextId.toString())
            const res: Array<Booking & { cid: string, pricePerHour: bigint }> = []
            for (let i = 1n; i < nextId; i++) {
                try {
                    const result = await publicClient.readContract({
                        address: CONTRACTS.BOOKING as `0x${string}`,
                        abi: bookingAbi as any,
                        functionName: 'bookings',
                        args: [i]
                    }) as [string, bigint, bigint, bigint, bigint, boolean]
                    const [renter, listingId, startTs, endTs, amount, released] = result
                    console.log(`Booking ${i}:`, { renter, myAddress: address, match: renter?.toLowerCase?.() === address.toLowerCase() })
                    if (renter && renter.toLowerCase() === address.toLowerCase()) {
                        console.log('Match found, fetching listing details for:', listingId.toString())
                        const [_owner, pricePerHour, metadataCID, _active] = await publicClient.readContract({
                            address: CONTRACTS.LISTING as `0x${string}`,
                            abi: listingAbi as any,
                            functionName: 'getListing',
                            args: [listingId]
                        }) as [string, bigint, string, boolean]
                        res.push({ id: i, listingId, startTs, endTs, amount, released, cid: metadataCID, pricePerHour })
                    }
                } catch (e: any) {
                    console.error(`Error reading booking ${i}:`, e)
                }
            }
            console.log('Found bookings:', res.length, res)
            setBookings(res)
        } catch (e: any) {
            console.error('Error loading bookings:', e)
            setError(String(e.message || e))
        } finally {
            loadingRef.current = false
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [address, publicClient])

    useEffect(() => {
        if (!publicClient) return
        const unwatch = publicClient.watchBlocks({ onBlock: () => { load() } })
        return () => unwatch?.()
    }, [publicClient])

    return (
        <div>
            <h3 className="text-lg font-medium mb-2">My Bookings</h3>
            <div className="mb-2">
                <button onClick={load} className="text-sm underline" disabled={loading}>Refresh</button>
                {loading && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
                {error && <div className="mt-2 text-sm text-red-600">Error: {error}</div>}
            </div>
            {address && (
                <div className="mb-2 text-xs text-gray-500">
                    Checking for bookings from: {address.slice(0, 10)}...{address.slice(-8)}
                </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {bookings.map(b => (
                    <div key={String(b.id)} className="border rounded-md p-3">
                        {b.cid && <img src={`https://ipfs.io/ipfs/${b.cid}`} className="w-full h-40 object-cover rounded" />}
                        <div className="mt-2 text-sm">Booking #{String(b.id)} for Listing #{String(b.listingId)}</div>
                        <div className="text-sm">Date: {formatDateUTC(b.startTs)} ({formatDateRange(b.startTs, b.endTs)})</div>
                        <div className="text-sm">Amount paid: {b.amount.toString()}</div>
                        <div className="text-xs text-gray-500">Released: {b.released ? 'yes' : 'no'}</div>
                    </div>
                ))}
            </div>
            {bookings.length === 0 && !loading && (
                <div className="text-sm">
                    No bookings yet. {address ? 'Make a booking on the Listings tab.' : 'Connect your wallet first.'}
                </div>
            )}
        </div>
    )
}

function formatDateUTC(sec: bigint) {
    const ms = Number(sec) * 1000
    return new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
function formatDateRange(start: bigint, end: bigint) {
    return `${new Date(Number(start) * 1000).toISOString().slice(11, 16)}–${new Date(Number(end) * 1000).toISOString().slice(11, 16)} UTC`
}


