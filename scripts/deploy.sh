#!/usr/bin/env bash

# Bitcoin Yield Bridge Deployment Script
# Usage: ./deploy.sh [network] [env_file]

set -e

NETWORK=${1:-"sepolia"}
ENV_FILE=${2:-".env"}

echo "🚀 Deploying Bitcoin Yield Bridge to $NETWORK"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    export $(cat $ENV_FILE | xargs)
else
    echo "⚠️  Environment file $ENV_FILE not found"
    echo "Please create it with the following variables:"
    echo "STARKNET_RPC_URL=<your_rpc_url>"
    echo "STARKNET_ACCOUNT=<your_account>"
    echo "STARKNET_KEYSTORE=<your_keystore_path>"
    exit 1
fi

# Build contracts
echo "🔨 Building contracts..."
scarb build

# Deploy contract
echo "📦 Deploying BitcoinYieldBridge..."

# Replace these with actual addresses for your deployment
OWNER_ADDRESS="0x01234567890abcdef" # Replace with actual owner address
VESU_PROTOCOL="0x02345678901bcdefg" # Replace with actual Vesu address
TROVES_PROTOCOL="0x03456789012cdefgh" # Replace with actual Troves address  
ATOMIQ_BRIDGE="0x04567890123defghi" # Replace with actual Atomiq address
AVNU_PAYMASTER="0x05678901234efghij" # Replace with actual AVNU address

starknet deploy \
    --contract target/dev/bitcoin_yield_bridge_BitcoinYieldBridge.contract_class.json \
    --inputs $OWNER_ADDRESS $VESU_PROTOCOL $TROVES_PROTOCOL $ATOMIQ_BRIDGE $AVNU_PAYMASTER \
    --network $NETWORK

echo "✅ Deployment completed!"
echo "📝 Don't forget to:"
echo "   1. Verify the contract on Starkscan"
echo "   2. Add initial yield strategies"
echo "   3. Update frontend with contract address"