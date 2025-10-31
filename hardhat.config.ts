import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  typechain: {
    outDir: "frontend/src/abi/types",
    target: "ethers-v6",
  },
  paths: {
    sources: "contracts",
    tests: "test",
    cache: "cache",
    artifacts: "artifacts",
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};

export default config;
