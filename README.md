# GuapcoinX Blockchain

![GuapcoinX Logo](https://guapcoinx.com/logo.png)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Discord](https://img.shields.io/discord/YOUR_DISCORD_ID)](https://discord.gg/guapcoinx)

## Overview

GuapcoinX is a high-performance EVM-compatible blockchain built for speed, scalability, and low fees. Powered by Hyperledger Besu with QBFT consensus, GuapcoinX provides a robust infrastructure for DeFi, NFTs, and Web3 applications.

## Key Features

- ⚡ **2-second block times** - Near-instant transaction finality
- 💰 **Ultra-low transaction fees** - Minimal cost for all operations
- 🔒 **QBFT consensus** - Byzantine Fault Tolerant with 5 validators
- 🌉 **Bridge to Arbitrum** - Cross-chain connectivity (coming soon)
- 🏗️ **Full EVM compatibility** - Deploy existing Ethereum dApps without modification
- 🚀 **High throughput** - 30M gas block limit for complex operations

## Quick Start

### Connect to GuapcoinX

- **Chain ID**: 71111
- **Native Token**: GUAPX (18 decimals)
- **RPC Endpoints**:
  - https://rpc-mainnet.guapcoinx.com
  - https://rpc-mainnet-1.guapcoinx.com
  - https://rpc-mainnet-2.guapcoinx.com
- **WebSocket**: wss://rpc-mainnet.guapcoinx.com/ws
- **Explorer**: https://explorer.guapcoinx.com

### Add to MetaMask

```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x115C7', // 71111 in hex
    chainName: 'GuapcoinX',
    nativeCurrency: {
      name: 'GUAPX',
      symbol: 'GUAPX',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mainnet.guapcoinx.com'],
    blockExplorerUrls: ['https://explorer.guapcoinx.com']
  }]
});
```

## Running a Node

### Using Docker Compose

1. Clone this repository:
```bash
git clone https://github.com/Guapcoin-Org/GuapcoinX
cd GuapcoinX
```

2. Start the node:
```bash
docker-compose up -d
```

3. Check node status:
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}'
```

### Using Docker Directly

```bash
docker run -d \
  --name guapcoinx-node \
  -p 8545:8545 \
  -p 30303:30303 \
  -v $(pwd)/data:/var/lib/besu \
  -v $(pwd)/config:/config \
  hyperledger/besu:25.10.0 \
  --genesis-file=/config/genesis.json \
  --static-nodes-file=/config/static-nodes.json \
  --rpc-http-enabled \
  --rpc-http-host=0.0.0.0 \
  --rpc-http-cors-origins="*" \
  --rpc-http-api=ETH,NET,WEB3,DEBUG,TXPOOL \
  --host-allowlist="*"
```

## Development

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for dApp development)
- Git

### Building from Source

GuapcoinX uses Hyperledger Besu as its client. To build and run from source:

1. Install Besu:
```bash
# Using Homebrew (macOS)
brew install hyperledger/besu/besu

# Using apt (Ubuntu/Debian)
wget https://hyperledger.jfrog.io/artifactory/besu-binaries/besu/25.10.0/besu-25.10.0.tar.gz
tar -xzf besu-25.10.0.tar.gz
```

2. Configure and run:
```bash
besu --genesis-file=config/genesis.json \
     --static-nodes-file=config/static-nodes.json \
     --rpc-http-enabled \
     --rpc-http-api=ETH,NET,WEB3 \
     --host-allowlist="*"
```

### Smart Contract Development

#### Using Hardhat

```javascript
// hardhat.config.js
module.exports = {
  networks: {
    guapcoinx: {
      url: 'https://rpc-mainnet.guapcoinx.com',
      chainId: 71111,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 5000000000, // 5 Gwei
    }
  }
};
```

Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network guapcoinx
```

#### Using Foundry

```toml
# foundry.toml
[profile.default]
src = 'src'
out = 'out'
libs = ['lib']

[rpc_endpoints]
guapcoinx = "https://rpc-mainnet.guapcoinx.com"
```

Deploy:
```bash
forge create --rpc-url guapcoinx \
  --private-key $PRIVATE_KEY \
  src/MyContract.sol:MyContract
```

## Token Information

### Native Token (GUAPX)
- **Symbol**: GUAPX
- **Decimals**: 18
- **Use Case**: Gas fees only

### GUAP Token
- **Contract**: `0x013A109A02FaEf81c4b8D3339D615861621CB65d`
- **Type**: ERC-20
- **Decimals**: 18
- **Use Cases**: DEX fees, liquidity incentives, governance

## Network Architecture

### Validators (Permissioned)
GuapcoinX uses a **permissioned validator set**. New validators must be voted in by existing validators.

**Current Validators (5 nodes):**
- Validator 1: 149.102.138.47
- Validator 2: 149.102.138.50
- Validator 3: 185.182.187.226
- Validator 4: 38.242.136.249
- Validator 5: 38.242.134.203

**Want to become a validator?**
Contact the GuapcoinX team via [guap.network](https://www.guap.network/) to discuss validator requirements and the voting process.

> **Note:** Running `run-validator-node.sh` with an unauthorized key will not grant validator privileges. Your node will function as a full node but won't participate in block production.

### Consensus
- **Algorithm**: QBFT (Quorum Byzantine Fault Tolerant)
- **Block Time**: ~2 seconds
- **Finality**: Immediate (no confirmations needed)
- **Fault Tolerance**: Can withstand up to 1 faulty validator
- **Validator Set**: Permissioned (requires voting to join)

## API Reference

GuapcoinX supports the standard Ethereum JSON-RPC API:

- `eth_*` - Ethereum protocol methods
- `net_*` - Network status methods
- `web3_*` - Web3 utility methods
- `debug_*` - Debug and trace methods
- `txpool_*` - Transaction pool inspection

Full API documentation: https://docs.guapcoinx.com/api

## Resources

- 🌐 [Website](https://www.guap.network/)
- 📊 [Block Explorer](https://explorer.guapcoinx.com)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

### Reporting Vulnerabilities
Please report security vulnerabilities to security@guapcoinx.com. Do not create public issues for security problems.

### Bug Bounty Program
We offer rewards for responsibly disclosed vulnerabilities. See our [Bug Bounty Program](https://docs.guapcoinx.com/security/bug-bounty) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on [Hyperledger Besu](https://www.hyperledger.org/use/besu)
- Consensus powered by QBFT
- Community-driven development

---

<p align="center">
  Made with ❤️ by the GuapcoinX Team
</p>