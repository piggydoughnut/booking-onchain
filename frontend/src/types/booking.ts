import type { BookingManager } from "@/abi/types";

export type Booking = {
  id: bigint;
  listingId: bigint;
  startTs: bigint;
  endTs: bigint;
  amount: bigint;
  released: boolean;
};

export type UseBookListingResult = {
  bookListing: (listingId: bigint, startTs: bigint, endTs: bigint) => void;
  hash?: `0x${string}` | undefined;
  isPending: boolean;
  waiting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
};

export type UseMyBookingsResult = {
  bookings: BookingWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export type BookingWithDetails = Booking & {
  cid: string;
  pricePerHour: bigint;
};

export type BookingTuple = Awaited<ReturnType<BookingManager["bookings"]>>;
export type NextBookingIdReturn = Awaited<
  ReturnType<BookingManager["nextBookingId"]>
>;
