#!/bin/bash

# GuapcoinX Validator Node Runner Script
# This script starts a GuapcoinX validator node for consensus participation
# NOTE: Requires validator private key to participate in consensus

echo "🔐 GuapcoinX Validator Node Runner"
echo "====================================="

# Default values
DATA_DIR="./validator-data"
DOCKER_NAME="guapcoinx-validator"
RPC_PORT=8645
WS_PORT=8646
P2P_PORT=30403
KEY_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --key-file)
            KEY_FILE="$2"
            shift 2
            ;;
        --data-dir)
            DATA_DIR="$2"
            shift 2
            ;;
        --rpc-port)
            RPC_PORT="$2"
            shift 2
            ;;
        --ws-port)
            WS_PORT="$2"
            shift 2
            ;;
        --p2p-port)
            P2P_PORT="$2"
            shift 2
            ;;
        --name)
            DOCKER_NAME="$2"
            shift 2
            ;;
        --help)
            echo "Usage: ./run-validator-node.sh --key-file <path-to-nodekey> [options]"
            echo ""
            echo "Required:"
            echo "  --key-file PATH    Path to validator private key file (nodekey)"
            echo ""
            echo "Options:"
            echo "  --data-dir PATH    Data directory (default: ./validator-data)"
            echo "  --rpc-port PORT    JSON-RPC port (default: 8645)"
            echo "  --ws-port PORT     WebSocket port (default: 8646)"
            echo "  --p2p-port PORT    P2P port (default: 30403)"
            echo "  --name NAME        Docker container name (default: guapcoinx-validator)"
            echo "  --help             Show this help message"
            echo ""
            echo "Note: Validator nodes require a private key to participate in consensus."
            echo "      Contact the GuapcoinX team if you want to become a validator."
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check if key file was provided
if [ -z "$KEY_FILE" ]; then
    echo "❌ Error: Validator key file is required"
    echo "Use --key-file to specify the path to your validator nodekey"
    echo ""
    echo "If you want to run a regular RPC node instead, use ./run-rpc-node.sh"
    exit 1
fi

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: Key file not found: $KEY_FILE"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if container is already running
if docker ps | grep -q $DOCKER_NAME; then
    echo "⚠️  Container $DOCKER_NAME is already running"
    echo "Stop it first with: docker stop $DOCKER_NAME"
    exit 1
fi

# Create directories
mkdir -p "$DATA_DIR"
mkdir -p "$DATA_DIR/keys"
mkdir -p "$DATA_DIR/logs"

# Copy configuration files
CONFIG_DIR="$(dirname "$0")/../config"
if [ -f "$CONFIG_DIR/genesis.json" ]; then
    cp "$CONFIG_DIR/genesis.json" "$DATA_DIR/"
    echo "✅ Copied genesis.json"
else
    echo "❌ Error: genesis.json not found in $CONFIG_DIR"
    exit 1
fi

if [ -f "$CONFIG_DIR/static-nodes.json" ]; then
    cp "$CONFIG_DIR/static-nodes.json" "$DATA_DIR/"
    echo "✅ Copied static-nodes.json"
else
    echo "❌ Error: static-nodes.json not found in $CONFIG_DIR"
    exit 1
fi

# Copy validator key
cp "$KEY_FILE" "$DATA_DIR/keys/nodekey"
chmod 600 "$DATA_DIR/keys/nodekey"
echo "✅ Copied validator key"

echo ""
echo "📋 Configuration:"
echo "  Data Directory: $DATA_DIR"
echo "  RPC Port: $RPC_PORT"
echo "  WebSocket Port: $WS_PORT"
echo "  P2P Port: $P2P_PORT"
echo "  Container Name: $DOCKER_NAME"
echo "  Key File: $KEY_FILE"
echo ""
echo "⚠️  WARNING: This node will participate in consensus!"
echo "   Ensure your validator key is kept secure."
echo ""

# Remove old container if it exists
docker rm $DOCKER_NAME 2>/dev/null

# Start the validator node
echo "🔄 Starting GuapcoinX validator node..."
docker run -d \
    --name $DOCKER_NAME \
    --restart unless-stopped \
    -p $RPC_PORT:8545 \
    -p $WS_PORT:8546 \
    -p $P2P_PORT:30303 \
    -p $P2P_PORT:30303/udp \
    -v "$(pwd)/$DATA_DIR":/var/lib/besu \
    -v "$(pwd)/$DATA_DIR/logs":/var/log/besu \
    hyperledger/besu:25.10.0 \
    --genesis-file=/var/lib/besu/genesis.json \
    --static-nodes-file=/var/lib/besu/static-nodes.json \
    --node-private-key-file=/var/lib/besu/keys/nodekey \
    --data-path=/var/lib/besu \
    --network-id=71111 \
    --rpc-http-enabled \
    --rpc-http-host=0.0.0.0 \
    --rpc-http-port=8545 \
    --rpc-http-cors-origins="*" \
    --rpc-http-api=ETH,NET,WEB3,DEBUG,TXPOOL,QBFT,ADMIN \
    --rpc-ws-enabled \
    --rpc-ws-host=0.0.0.0 \
    --rpc-ws-port=8546 \
    --rpc-ws-api=ETH,NET,WEB3,DEBUG,TXPOOL,QBFT \
    --host-allowlist="*" \
    --logging=INFO \
    --min-gas-price=1000000000 \
    --tx-pool-max-size=5000 \
    --tx-pool-retention-hours=12 \
    --sync-mode=FULL \
    --max-peers=100 \
    --nat-method=DOCKER

if [ $? -eq 0 ]; then
    echo "✅ GuapcoinX validator node started successfully!"
    echo ""
    echo "📊 Validator Information:"
    echo "  RPC URL: http://localhost:$RPC_PORT"
    echo "  WebSocket URL: ws://localhost:$WS_PORT"
    echo ""
    echo "🔍 Useful commands:"
    echo "  View logs:        docker logs -f $DOCKER_NAME"
    echo "  Stop validator:   docker stop $DOCKER_NAME"
    echo "  Remove validator: docker rm $DOCKER_NAME"
    echo ""
    echo "  Check validator status:"
    echo "    curl -X POST http://localhost:$RPC_PORT \\"
    echo "      -H \"Content-Type: application/json\" \\"
    echo "      --data '{\"jsonrpc\":\"2.0\",\"method\":\"qbft_getValidatorsByBlockNumber\",\"params\":[\"latest\"],\"id\":1}'"
    echo ""
    echo "  Check if this node is proposing blocks:"
    echo "    curl -X POST http://localhost:$RPC_PORT \\"
    echo "      -H \"Content-Type: application/json\" \\"
    echo "      --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBlockByNumber\",\"params\":[\"latest\",false],\"id\":1}'"
    echo ""
    echo "🎉 Your GuapcoinX validator node is now participating in consensus!"
    echo "📢 Monitor your validator closely to ensure uptime and performance."
else
    echo "❌ Failed to start GuapcoinX validator node"
    echo "Check Docker logs for more information"
    exit 1
fi