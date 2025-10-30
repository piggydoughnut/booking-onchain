import { defineChain } from "viem";

export const localhost = defineChain({
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: { name: "PAS", symbol: "PAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC || "http://127.0.0.1:8545"],
    },
    public: {
      http: [import.meta.env.VITE_RPC || "http://127.0.0.1:8545"],
    },
  },
});
