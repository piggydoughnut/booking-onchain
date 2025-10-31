import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { parseUnits } from "viem";
import membershipAbi from "../abi/MembershipManager.json";
import type { Abi } from "viem";
import { CONTRACTS } from "../config/contracts";
import {
  CHAIN_ID,
  DEFAULT_TOKEN_DECIMALS,
  DEFAULT_MEMBERSHIP_AMOUNT,
} from "../config/constants";
import type { UseBuyMembershipResult } from "@/types/membership";

const membershipAddress = (CONTRACTS.MEMBERSHIP || undefined) as
  | `0x${string}`
  | undefined;

/**
 * Check if an address is a member
 */
export function useMembershipStatus(
  address?: `0x${string}`
): ReturnType<typeof useReadContract> {
  if (!membershipAddress) {
    throw new Error("Membership contract address not set");
  }

  const chainId = useChainId();
  return useReadContract({
    address: membershipAddress,
    abi: membershipAbi as Abi,
    functionName: "isMember",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && membershipAddress && chainId === CHAIN_ID),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: "always",
    },
  });
}

/**
 * Get membership expiry timestamp
 */
export function useMembershipExpiry(
  address?: `0x${string}`
): ReturnType<typeof useReadContract> {
  if (!membershipAddress) {
    throw new Error("Membership contract address not set");
  }

  const chainId = useChainId();
  return useReadContract({
    address: membershipAddress,
    abi: membershipAbi as Abi,
    functionName: "membershipExpiresAt",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && membershipAddress && chainId === CHAIN_ID),
      refetchOnReconnect: true,
      refetchOnMount: "always",
    },
  });
}

/**
 * Buy/renew membership
 * If you are already a member, this will renew your membership by a month.
 * If you are not a member, this will buy a new membership for a month.
 *
 * @param amount - The amount of tokens to buy/renew membership in smallest unit of accepted token (e.g., DOT XC-20)
 * @param decimals - The number of decimals of the accepted token (default is 18)
 *
 */
export function useBuyMembership(): UseBuyMembershipResult {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const {
    isLoading: waiting,
    isSuccess,
    isError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const buyMembership = (
    amount: string = DEFAULT_MEMBERSHIP_AMOUNT,
    decimals: number = DEFAULT_TOKEN_DECIMALS
  ) => {
    if (!membershipAddress) {
      throw new Error("Membership contract address not set");
    }
    writeContract({
      address: membershipAddress,
      abi: membershipAbi as Abi,
      functionName: "becomeMember",
      args: [],
      value: parseUnits(amount, decimals),
    });
  };

  return {
    buyMembership,
    hash,
    isPending,
    waiting,
    isSuccess,
    isError,
    error: error || receiptError,
  };
}
