import { useAccount, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import BurgundyBox from '@/components/ui/burgundy-box'
import ErrorBox from '@/components/ui/error-box'
import { useEffect } from 'react'
import { useMembershipStatus, useMembershipExpiry, useBuyMembership } from '@/hooks/useMembership'
import { CONTRACTS } from '@/config/contracts'
import { CHAIN_ID, DEFAULT_MEMBERSHIP_AMOUNT, DEFAULT_TOKEN_DECIMALS } from '@/config/constants'
import { formatUtcDateFromSeconds } from '@/lib/utils'


const membershipAddress = (CONTRACTS.MEMBERSHIP || undefined) as `0x${string}` | undefined

export default function Membership() {
    const { address } = useAccount()
    const chainId = useChainId()
    const { data: isMember, refetch, error, isPending: readPending } = useMembershipStatus(address)
    const { data: expiry, refetch: refetchExpiry } = useMembershipExpiry(address)
    const hasExpiry = typeof expiry === 'bigint' || typeof expiry === 'number'
    const { buyMembership, isPending, waiting, isSuccess } = useBuyMembership()

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
        refetch()
    }, [address, membershipAddress, refetch])

    const onBuy = () => {
        buyMembership(DEFAULT_MEMBERSHIP_AMOUNT, DEFAULT_TOKEN_DECIMALS)
    }

    return (
        <div className="space-y-6">
            <div className="ornate-divider"></div>
            <h3 className="text-3xl text-burgundy mb-6">Membership</h3>
            <div className="flex flex-row gap-4">
                <BurgundyBox label="Status:">
                    <p className={`text-lg font-semibold ${isMember ? 'text-secondary-dark' : 'text-burgundy-dark'}`}>
                        {!address ? 'Connect wallet' : !membershipAddress ? 'Contract not set' : (chainId !== CHAIN_ID ? 'Wrong network' : readPending ? 'Loading…' : (typeof isMember === 'boolean' ? (isMember ? '✓ Active Member' : 'Not a member') : 'Loading…'))}
                    </p>
                </BurgundyBox>
                {!!error && (
                    <ErrorBox title="Error">
                        {error instanceof Error ? error.message : String(error)}
                    </ErrorBox>
                )}
                {(hasExpiry && Boolean(isMember)) && (
                    <BurgundyBox label="Membership Expires:">
                        <p className="text-lg font-semibold text-foreground">{formatUtcDateFromSeconds(expiry as number | bigint)}</p>
                    </BurgundyBox>
                )}
            </div>
            <div className="pt-4">
                <Button onClick={onBuy} disabled={isPending || waiting} size="lg" className="w-full md:w-auto">
                    {isPending || waiting ? 'Processing...' : isMember ? 'Extend membership' : 'Buy membership'}
                </Button>
            </div>
            {(isPending || waiting) && (
                <div className="p-3 bg-gold/10 border border-gold rounded-sm">
                    <p className="text-sm text-foreground/70 italic">Transaction in progress...</p>
                </div>
            )}
            <div className="ornate-divider mt-8"></div>
        </div>
    )
}


