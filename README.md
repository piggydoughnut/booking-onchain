# Booking Onchain – Memberships, Listings, and Bookings

POC for a decentralized room/table booking system

This repository contains Solidity smart contracts and a Hardhat project that implement:

- MembershipManager: Users pay the chain native currency to become members for a period.
- ListingManager: Create coworking listings (desks, rooms) with IPFS CID metadata and availability tracking.
- BookingManager: Members can book available listings. Bookings are currently free (no payment collected).
- AccessNFT (optional): Non-transferable NFT granting temporary access aligned to booking expiry.

Payments use the chain native currency (no ERC-20). Booking is nonpayable (free) in the current setup.

## Quickstart

1. Install deps (pnpm)

```bash
pnpm install
```

2. One-command start (recommended)

```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

This will:

- Start a local Hardhat node (background)
- Compile and deploy contracts
- Generate `deployed.local.json` and `frontend/.env` with RPC and deployed addresses
- Seed mock listings with example IPFS CIDs
- Start the frontend dev server

2. Start local Hardhat node (new terminal)

```bash
pnpm run node
```

### Manual flow (alternative)

1. Compile

```bash
pnpm run compile
```

2 Deploy to local Hardhat (localhost network)

```bash
pnpm run deploy  # deploys to localhost (http://127.0.0.1:8545)
```

3 Frontend env

The deploy script writes `frontend/.env` automatically with values like:

```bash
VITE_RPC=http://127.0.0.1:8545
VITE_MEMBERSHIP_ADDRESS=0x...
VITE_LISTING_ADDRESS=0x...
VITE_BOOKING_ADDRESS=0x...
VITE_ACCESS_NFT_ADDRESS=0x...
```

If you prefer, you can edit these manually.

## Design Overview

- Memberships: Users acquire membership by paying the chain native currency; membership expiry is tracked on-chain.
- Listings: `createListing(cid, priceOrFree)` stores owner, metadata CID, and active flag. `isAvailable()` checks for overlaps against stored booked intervals. Only `BookingManager` can `blockInterval`.
- Bookings: `book(listingId, startTs, endTs)` validates membership, checks availability, stores booking with `amount=0` (free), blocks interval, and optionally mints an `AccessNFT` keyed by bookingId with expiry = `endTs`. `release()` / `refund()` operate on `amount` (0 in current setup).

## Notes

- Time resolution is seconds. Pricing is currently disabled for booking (free). If re-enabled, prefer deriving price fully on-chain.
- AccessNFT is non-transferable to model temporary access keys; ownership can be burned by holder or contract owner.
- Membership `becomeMember`/`renewMembership` are payable. `book` is nonpayable in this repo’s current state.

### References

- Polkadot smart contracts (Solidity/EVM compatibility and PolkaVM): [docs.polkadot.com – Smart Contracts](https://docs.polkadot.com/develop/smart-contracts/)
- Asset Hub overview and smart contracts support: [Polkadot Support – What is Asset Hub](https://support.polkadot.network/support/solutions/articles/65000181800-what-is-asset-hub-and-how-do-i-use-it-)

## Frontend (Pure Client-Side, IPFS/IPNS)

The UI is a static Vite + React SPA under `frontend/` — no servers required.

Stack and conventions:

- React + Vite + TypeScript
- UI: shadcn/ui + Tailwind CSS
- Wallet: RainbowKit + wagmi
- Data: @tanstack/react-query
- Path alias: `@/*` → `src/*`
- Reads/writes live only in hooks in `src/hooks/`; components do not hardcode addresses and import from `src/config/contracts`.

Setup:

```bash
cd frontend
pnpm install
```

Create `frontend/.env` with:

```bash
VITE_RPC=http://127.0.0.1:8545
VITE_MEMBERSHIP_ADDRESS=0x...
VITE_LISTING_ADDRESS=0x...
VITE_BOOKING_ADDRESS=0x...
VITE_ACCESS_NFT_ADDRESS=0x...
```

Build:

```bash
pnpm run build
```

The static site is in `frontend/dist`. You can publish to IPFS and pin; then publish the latest CID to IPNS:

```bash
ipfs add -r frontend/dist
ipfs name publish <CID>
```
