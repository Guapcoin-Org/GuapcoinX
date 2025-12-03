#!/bin/bash

# GuapcoinX RPC Node Runner Script
# This script starts a GuapcoinX RPC node for API access

echo "🚀 GuapcoinX RPC Node Runner"
echo "================================"

# Default values
DATA_DIR="./data"
DOCKER_NAME="guapcoinx-rpc"
RPC_PORT=8545
WS_PORT=8546
P2P_PORT=30303

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
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
            echo "Usage: ./run-rpc-node.sh [options]"
            echo ""
            echo "Options:"
            echo "  --data-dir PATH    Data directory (default: ./data)"
            echo "  --rpc-port PORT    JSON-RPC port (default: 8545)"
            echo "  --ws-port PORT     WebSocket port (default: 8546)"
            echo "  --p2p-port PORT    P2P port (default: 30303)"
            echo "  --name NAME        Docker container name (default: guapcoinx-rpc)"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

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

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"
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

echo ""
echo "📋 Configuration:"
echo "  Data Directory: $DATA_DIR"
echo "  RPC Port: $RPC_PORT"
echo "  WebSocket Port: $WS_PORT"
echo "  P2P Port: $P2P_PORT"
echo "  Container Name: $DOCKER_NAME"
echo ""

# Remove old container if it exists
docker rm $DOCKER_NAME 2>/dev/null

# Start the RPC node
echo "🔄 Starting GuapcoinX RPC node..."
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
    --data-path=/var/lib/besu \
    --network-id=71111 \
    --rpc-http-enabled \
    --rpc-http-host=0.0.0.0 \
    --rpc-http-port=8545 \
    --rpc-http-cors-origins="*" \
    --rpc-http-api=ETH,NET,WEB3,DEBUG,TXPOOL \
    --rpc-ws-enabled \
    --rpc-ws-host=0.0.0.0 \
    --rpc-ws-port=8546 \
    --rpc-ws-api=ETH,NET,WEB3,DEBUG,TXPOOL \
    --host-allowlist="*" \
    --logging=INFO \
    --min-gas-price=1000000000 \
    --tx-pool-max-size=5000 \
    --tx-pool-retention-hours=12 \
    --sync-mode=FAST \
    --max-peers=50 \
    --nat-method=DOCKER

if [ $? -eq 0 ]; then
    echo "✅ GuapcoinX RPC node started successfully!"
    echo ""
    echo "📊 Node Information:"
    echo "  RPC URL: http://localhost:$RPC_PORT"
    echo "  WebSocket URL: ws://localhost:$WS_PORT"
    echo ""
    echo "🔍 Useful commands:"
    echo "  View logs:        docker logs -f $DOCKER_NAME"
    echo "  Stop node:        docker stop $DOCKER_NAME"
    echo "  Remove node:      docker rm $DOCKER_NAME"
    echo "  Check sync status:"
    echo "    curl -X POST http://localhost:$RPC_PORT \\"
    echo "      -H \"Content-Type: application/json\" \\"
    echo "      --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_syncing\",\"params\":[],\"id\":1}'"
    echo ""
    echo "🎉 Your GuapcoinX RPC node is now syncing with the network!"
else
    echo "❌ Failed to start GuapcoinX RPC node"
    echo "Check Docker logs for more information"
    exit 1
fi