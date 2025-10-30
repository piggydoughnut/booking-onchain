import { useState } from 'react'
import bookingAbi from '../abi/BookingManager.json'
import { CONTRACTS } from '../config/contracts'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function Booking() {
    const [listingId, setListingId] = useState('')
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')
    const { writeContract, data: hash, isPending } = useWriteContract()
    const [payment, setPayment] = useState('')
    const { isLoading: waiting } = useWaitForTransactionReceipt({ hash })

    const onBook = () => {
        if (!listingId || !start || !end) return
        writeContract({
            address: CONTRACTS.BOOKING as `0x${string}`,
            abi: bookingAbi as any,
            functionName: 'book',
            args: [BigInt(listingId), BigInt(start), BigInt(end)],
            value: payment ? parseUnits(payment, 18) : undefined
        })
    }

    return (
        <div>
            <h3 className="text-lg font-medium mb-2">Booking</h3>
            <div className="grid gap-2 max-w-md">
                <Input placeholder="Listing ID" value={listingId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingId(e.target.value)} />
                <Input placeholder="Start timestamp (sec)" value={start} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStart(e.target.value)} />
                <Input placeholder="End timestamp (sec)" value={end} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnd(e.target.value)} />
                <Input placeholder="Payment" value={payment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayment(e.target.value)} />
                <Button onClick={onBook} disabled={isPending || waiting}>Book</Button>
            </div>
            {(isPending || waiting) && <div className="mt-2 text-sm">Submitting...</div>}
        </div>
    )
}


