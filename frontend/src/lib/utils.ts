import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";
import { DEFAULT_TOKEN_DECIMALS } from "../config/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a bigint amount (in wei/smallest unit) to a human-readable string.
 * Avoids floating point precision issues by formatting to 6 decimals and removing trailing zeros.
 */
export function formatAmount(amount: bigint): string {
  const value = formatUnits(amount, DEFAULT_TOKEN_DECIMALS);
  // Parse to float, format to 6 decimals, then remove trailing zeros
  return parseFloat(value)
    .toFixed(6)
    .replace(/\.?0+$/, "");
}

/**
 * Format a unix timestamp (seconds) into a UTC date string, e.g., "31 October 2025".
 */
export function formatUtcDateFromSeconds(value: bigint | number): string {
  const millisecondsSinceEpoch = Number(value) * 1000;
  return new Date(millisecondsSinceEpoch).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Format a time range in UTC from start/end unix timestamps (seconds), e.g., "13:00–14:30 UTC".
 */
export function formatUtcTimeRangeFromSeconds(
  startSeconds: bigint | number,
  endSeconds: bigint | number
): string {
  const start = new Date(Number(startSeconds) * 1000)
    .toISOString()
    .slice(11, 16);
  const end = new Date(Number(endSeconds) * 1000).toISOString().slice(11, 16);
  return `${start}–${end} UTC`;
}
/**
 * Returns today's date in UTC as YYYY-MM-DD.
 */
export function todayIsoUTC(): string {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  return d.toISOString().slice(0, 10);
}

/**
 * Given an ISO date (YYYY-MM-DD), returns the UTC start and end timestamps (in seconds)
 * for that full day range [00:00, 24:00).
 */
export function getUtcDayRange(isoDate: string): {
  startSec: bigint;
  endSec: bigint;
} {
  const [y, m, d] = isoDate.split("-").map(Number);
  const startMs = Date.UTC(y, m - 1, d, 0, 0, 0);
  const endMs = startMs + 24 * 60 * 60 * 1000;
  return {
    startSec: BigInt(Math.floor(startMs / 1000)),
    endSec: BigInt(Math.floor(endMs / 1000)),
  };
}
