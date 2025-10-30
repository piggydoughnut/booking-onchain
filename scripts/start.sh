#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

export HARDHAT_ENABLE_TELEMETRY=false
echo "[0/5] Installing dependencies (root and frontend)..."
pnpm --prefix "$ROOT_DIR" install
pnpm --prefix "$ROOT_DIR/frontend" install

echo "[1/5] Starting local Hardhat node..."
pnpm --prefix "$ROOT_DIR" run node > "$LOG_DIR/hardhat-node.log" 2>&1 &
NODE_PID=$!
echo "Hardhat node PID: $NODE_PID (logs: $LOG_DIR/hardhat-node.log)"

echo "[2/5] Waiting for RPC at http://127.0.0.1:8545 ..."
for i in {1..60}; do
  if curl -s -X POST -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' http://127.0.0.1:8545 > /dev/null; then
    break
  fi
  sleep 1
done

echo "[3/5] Compiling contracts..."
pnpm --prefix "$ROOT_DIR" run compile

echo "[4/5] Deploying contracts to local node (localhost network)..."
pnpm --prefix "$ROOT_DIR" run deploy

echo "[5/5] Starting frontend dev server..."
cd "$ROOT_DIR/frontend"
pnpm run dev


