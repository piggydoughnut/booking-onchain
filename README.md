# booking-onchain

POC for a decentralized room/table booking system

# Booking Onchain – Memberships, Listings, and Bookings (Solidity)

This repository contains Solidity smart contracts and a Hardhat project that implement:

- MembershipManager: Users pay with an ERC-20-compatible Asset Hub asset (e.g., DOT on AssetHub Paseo) to become members for a period.
- ListingManager: Create coworking listings (desks, rooms) with price per hour, token, and IPFS CID metadata.
- BookingManager: Members can book available listings; funds are escrowed and released to the listing owner after checkout.
- AccessNFT (optional): Non-transferable NFT granting temporary access aligned to booking expiry.

Payments use the chain native currency via payable functions (no ERC-20).

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

3. Manual flow (alternative)

3.1 Compile

```bash
pnpm run compile
```

3.2 Deploy to local Hardhat (localhost network)

```bash
pnpm run deploy  # deploys to localhost (http://127.0.0.1:8545)
```

3.3 Frontend env

The deploy script writes `frontend/.env` automatically with values like:

```bash
VITE_RPC=http://127.0.0.1:8545
VITE_MEMBERSHIP_ADDRESS=0x...
VITE_LISTING_ADDRESS=0x...
VITE_BOOKING_ADDRESS=0x...
VITE_ACCESS_NFT_ADDRESS=0x...
VITE_ACCEPTED_TOKEN=
```

If you prefer, you can edit these manually.

## Design Overview

- Memberships: `becomeMember(paymentAmount)` and `renewMembership(account, paymentAmount)` pull tokens via `transferFrom` and extend `membershipExpiresAt`. Periods are `paymentAmount / pricePerPeriod` and duration is `periods * durationPerPeriod`.
- Listings: `createListing(token, pricePerHour, cid)` sets accepted token, price, and IPFS CID. `isAvailable()` checks for overlaps against stored booked intervals. Only the `BookingManager` can `blockInterval`.
- Bookings: `book(listingId, startTs, endTs)` validates membership, checks availability, pulls funds into escrow, stores booking, blocks interval, and optionally mints an `AccessNFT` keyed by bookingId with expiry = `endTs`. `release()` sends escrowed funds to the listing owner; `refund()` returns to the renter.

## Notes

- Time resolution is seconds; billing rounds up per hour: `ceil((end - start)/3600) * pricePerHour`.
- AccessNFT is non-transferable to model temporary access keys; ownership can be burned by holder or contract owner.
- Membership `becomeMember`/`renewMembership` are payable. `book` is payable and requires exact amount per hours.

### References

- Polkadot smart contracts (Solidity/EVM compatibility and PolkaVM): [docs.polkadot.com – Smart Contracts](https://docs.polkadot.com/develop/smart-contracts/)
- Asset Hub overview and smart contracts support: [Polkadot Support – What is Asset Hub](https://support.polkadot.network/support/solutions/articles/65000181800-what-is-asset-hub-and-how-do-i-use-it-)

## Frontend (Pure Client-Side, IPFS/IPNS)

The UI is a static Vite + React SPA under `frontend/` — no servers required.

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
VITE_ACCEPTED_TOKEN=
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
