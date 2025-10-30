import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient } from 'wagmi'
import membershipAbi from '../abi/MembershipManager.json'
import { CONTRACTS } from '../config/contracts'
import { parseUnits } from 'viem'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useEffect, useState } from 'react'

export default function Membership() {
    const { address } = useAccount()
    const chainId = useChainId()
    const publicClient = usePublicClient()
    const [hasCode, setHasCode] = useState<boolean | undefined>(undefined)

    const formatExpiryDate = (value: bigint | number) => {
        const ms = Number(value) * 1000
        return new Date(ms).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        })
    }
    const [amount, setAmount] = useState('1')
    const membershipAddress = (CONTRACTS.MEMBERSHIP || undefined) as `0x${string}` | undefined
    const { data: isMember, refetch, error, isPending: readPending } = useReadContract({
        address: membershipAddress,
        abi: membershipAbi as any,
        functionName: 'isMember',
        args: address ? [address] : undefined,
        query: {
            enabled: Boolean(address && membershipAddress),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: 'always'
        }
    })

    const { data: expiry, refetch: refetchExpiry } = useReadContract({
        address: membershipAddress,
        abi: membershipAbi as any,
        functionName: 'membershipExpiresAt',
        args: address ? [address] : undefined,
        query: {
            enabled: Boolean(address && membershipAddress),
            refetchOnReconnect: true,
            refetchOnMount: 'always'
        }
    })

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (isSuccess) {
            refetch()
            refetchExpiry()
        }
    }, [isSuccess, refetch, refetchExpiry])

    useEffect(() => {
        if (address && membershipAddress) {
            refetch()
            refetchExpiry()
        }
    }, [address, membershipAddress, chainId, refetch, refetchExpiry])

    useEffect(() => {
        (async () => {
            try {
                if (membershipAddress && publicClient) {
                    const code = await publicClient.getBytecode({ address: membershipAddress })
                    setHasCode(Boolean(code && code.length > 2))
                } else {
                    setHasCode(undefined)
                }
            } catch {
                setHasCode(undefined)
            }
        })()
    }, [membershipAddress, publicClient])

    useEffect(() => {
        refetch()
    }, [address, membershipAddress, refetch])

    const onBuy = () => {
        if (!amount) return
        writeContract({
            address: CONTRACTS.MEMBERSHIP as `0x${string}`,
            abi: membershipAbi as any,
            functionName: 'becomeMember',
            args: [],
            value: parseUnits(amount, 18)
        })
    }

    return (
        <div>
            <h3 className="text-lg font-medium mb-2">Membership</h3>
            {!address && (
                <div className="mb-2 text-sm">Connect wallet to check membership.</div>
            )}
            {!membershipAddress && address && (
                <div className="mb-2 text-sm text-red-600">Membership contract address is not set. Check frontend/.env.</div>
            )}
            {address && chainId !== 31337 && (
                <div className="mb-2 text-sm text-red-600">Wrong network. Please switch your wallet to the local Hardhat chain (31337).</div>
            )}
            <div className="mb-2">Status: <span className={isMember ? 'text-green-600' : 'text-red-600'}>{
                !address ? 'Connect wallet' : !membershipAddress ? 'Contract not set' : (chainId !== 31337 ? 'Wrong network' : readPending ? 'Loading…' : (typeof isMember === 'boolean' ? (isMember ? 'Active' : 'Not a member') : 'Loading…'))
            }</span></div>
            {error && <div className="text-sm text-red-600">{String(error.message || error)}</div>}
            <div className="text-xs text-gray-500 space-y-1">
                <div>Chain ID: {chainId}</div>
                <div>Membership contract: {membershipAddress || 'not set'}</div>
                {expiry !== undefined && (typeof expiry === 'bigint' || typeof expiry === 'number') && (
                    <div>Expiry: {formatExpiryDate(expiry)}</div>
                )}
                {hasCode !== undefined && <div>Code at address: {hasCode ? 'yes' : 'no'}</div>}
            </div>
            <div className="flex gap-2 max-w-md">
                <Input value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} placeholder="Payment amount" />
                <Button onClick={onBuy} disabled={isPending || waiting}>Buy/Renew</Button>
            </div>
            {(isPending || waiting) && <div className="mt-2 text-sm">Submitting...</div>}
        </div>
    )
}


