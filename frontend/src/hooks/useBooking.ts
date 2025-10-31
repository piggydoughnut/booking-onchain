import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useAccount,
  useChainId,
} from "wagmi";
import bookingAbi from "../abi/BookingManager.json";
import listingAbi from "../abi/ListingManager.json";
import { CONTRACTS } from "../config/contracts";
import { CHAIN_ID } from "../config/constants";
import { useEffect, useState, useRef } from "react";
import type {
  BookingTuple,
  BookingWithDetails,
  UseBookListingResult,
  UseMyBookingsResult,
  GetListingResult,
} from "@/types";
import type { Abi } from "viem";
/**
 * Book a listing (room, space, etc.)
 */
export function useBookListing(): UseBookListingResult {
  const bookingAddress = (CONTRACTS.BOOKING || undefined) as
    | `0x${string}`
    | undefined;
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const {
    isLoading: waiting,
    isSuccess,
    isError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const bookListing = (listingId: bigint, startTs: bigint, endTs: bigint) => {
    if (!bookingAddress) {
      throw new Error("Booking contract address not set");
    }
    writeContract({
      address: bookingAddress,
      abi: bookingAbi as Abi,
      functionName: "book",
      args: [listingId, startTs, endTs],
    });
  };

  return {
    bookListing,
    hash,
    isPending,
    waiting,
    isSuccess,
    isError,
    error: error || receiptError,
  };
}

/**
 * Fetch all bookings for the connected address
 */

export function useMyBookings(): UseMyBookingsResult {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const bookingAddress = (CONTRACTS.BOOKING || undefined) as
    | `0x${string}`
    | undefined;
  const listingAddress = (CONTRACTS.LISTING || undefined) as
    | `0x${string}`
    | undefined;

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const load = async () => {
    if (!address || !publicClient || !bookingAddress || !listingAddress) {
      return;
    }
    if (loadingRef.current || chainId !== CHAIN_ID) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const nextId = (await publicClient.readContract({
        address: bookingAddress,
        abi: bookingAbi as Abi,
        functionName: "nextBookingId",
        args: [],
      })) as bigint;

      const res: BookingWithDetails[] = [];
      for (let i = 1n; i < nextId; i++) {
        try {
          const result = (await publicClient.readContract({
            address: bookingAddress,
            abi: bookingAbi as Abi,
            functionName: "bookings",
            args: [i],
          })) as BookingTuple;

          const [renter, listingId, startTs, endTs, amount, released] = result;

          if (renter && renter.toLowerCase() === address.toLowerCase()) {
            const [_owner, pricePerHour, metadataCID, _active] =
              (await publicClient.readContract({
                address: listingAddress,
                abi: listingAbi as Abi,
                functionName: "getListing",
                args: [listingId],
              })) as GetListingResult;

            res.push({
              id: i,
              listingId,
              startTs,
              endTs,
              amount,
              released,
              cid: metadataCID,
              pricePerHour,
            });
          }
        } catch (e: unknown) {
          console.error(`Error reading booking ${i}:`, e);
        }
      }
      setBookings(res);
    } catch (e: unknown) {
      console.error("Error loading bookings:", e);
      setError(String((e as { message?: string })?.message || e));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [address, publicClient, bookingAddress, listingAddress, chainId]);

  useEffect(() => {
    if (!publicClient) return;
    const unwatch = publicClient.watchBlocks({
      onBlock: () => {
        load();
      },
    });
    return () => unwatch?.();
  }, [publicClient]);

  return { bookings, loading, error, refetch: load };
}
