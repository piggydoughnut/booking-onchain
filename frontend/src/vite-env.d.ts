/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC: string;
  readonly VITE_MEMBERSHIP_ADDRESS: string;
  readonly VITE_LISTING_ADDRESS: string;
  readonly VITE_BOOKING_ADDRESS: string;
  readonly VITE_ACCESS_NFT_ADDRESS: string;
  readonly VITE_ACCEPTED_TOKEN: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
