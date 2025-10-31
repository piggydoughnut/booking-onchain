import type { ListingManager } from "@/abi/types";

export type Listing = {
  id: bigint;
  owner: string;
  pricePerHour: bigint;
  cid: string;
  active: boolean;
};

export type UseListingsResult = {
  listings: Listing[];
  loading: boolean;
  error: Error | null;
};

export type GetListingResult = Awaited<
  ReturnType<ListingManager["getListing"]>
>;
export type IsAvailableReturn = Awaited<
  ReturnType<ListingManager["isAvailable"]>
>;
export type NextListingIdReturn = Awaited<
  ReturnType<ListingManager["nextListingId"]>
>;
