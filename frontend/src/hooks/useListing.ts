import { useReadContract, usePublicClient, useChainId } from "wagmi";
import listingAbi from "../abi/ListingManager.json";
import type { Abi } from "viem";
import { CONTRACTS } from "../config/contracts";
import { CHAIN_ID } from "../config/constants";
import { useEffect, useState } from "react";
import type { GetListingResult, Listing, UseListingsResult } from "@/types";
/**
 * Get a single listing by ID
 */
export function useListing(
  listingId: bigint | undefined
): ReturnType<typeof useReadContract> {
  const chainId = useChainId();
  const listingAddress = (CONTRACTS.LISTING || undefined) as
    | `0x${string}`
    | undefined;

  return useReadContract({
    address: listingAddress,
    abi: listingAbi as Abi,
    functionName: "getListing",
    args: listingId ? [listingId] : undefined,
    query: {
      enabled: Boolean(listingId && listingAddress && chainId === CHAIN_ID),
    },
  });
}

/**
 * Check if a listing is available for a time range
 */
export function useListingAvailability(
  listingId: bigint | undefined,
  startTs: bigint | undefined,
  endTs: bigint | undefined
): ReturnType<typeof useReadContract> {
  const chainId = useChainId();
  const listingAddress = (CONTRACTS.LISTING || undefined) as
    | `0x${string}`
    | undefined;

  return useReadContract({
    address: listingAddress,
    abi: listingAbi as Abi,
    functionName: "isAvailable",
    args:
      listingId !== undefined && startTs !== undefined && endTs !== undefined
        ? [listingId, startTs, endTs]
        : undefined,
    query: {
      enabled: Boolean(
        listingId !== undefined &&
          startTs !== undefined &&
          endTs !== undefined &&
          listingAddress &&
          chainId === CHAIN_ID
      ),
    },
  });
}

/**
 * Fetch all active listings
 */
export function useListings(): UseListingsResult {
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const listingAddress = (CONTRACTS.LISTING || undefined) as
    | `0x${string}`
    | undefined;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      if (!publicClient || !listingAddress || chainId !== CHAIN_ID) {
        setListings([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const nextId = (await publicClient.readContract({
          address: listingAddress,
          abi: listingAbi as Abi,
          functionName: "nextListingId",
          args: [],
        })) as bigint;

        const results: Listing[] = [];
        for (let i = 1n; i < nextId; i++) {
          try {
            const [owner, pricePerHour, metadataCID, active] =
              (await publicClient.readContract({
                address: listingAddress,
                abi: listingAbi as Abi,
                functionName: "getListing",
                args: [i],
              })) as GetListingResult;

            if (active) {
              results.push({
                id: i,
                owner,
                pricePerHour,
                cid: metadataCID,
                active,
              });
            }
          } catch (e) {
            // Skip invalid listings
            console.error(`Error fetching listing ${i}:`, e);
          }
        }
        setListings(results);
      } catch (e) {
        setError(e as Error);
        console.error("Error fetching listings:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [publicClient, listingAddress, chainId]);

  return { listings, loading, error };
}
