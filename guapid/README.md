# GuapID — Decentralized Identity on Guapcoin

GuapID is the official W3C DID (Decentralized Identifier) system for the Guapcoin blockchain. It enables self-sovereign digital identity anchored on-chain — no accounts, no approval, no middleman.

**Live:** [guapid.xyz](https://guapid.xyz)

---

## Overview

```
did:guap:<wallet-address>
```

Your wallet address is your DID. Creating a GuapID anchors a W3C-compliant DID Document to the Guapcoin blockchain via IPFS, making it permanently verifiable by anyone.

### Identity Tiers

| Tier | Description |
|------|-------------|
| **Pseudonymous** | Wallet-controlled DID, self-asserted |
| **Social Proof** | Linked socials, off-chain attestations *(Phase 2)* |
| **Verified** | In-person KYC by a Human Validator *(live)* |

---

## Architecture

```
Browser (React/Vite)
  └── ethers.js v6 → Guapcoin RPC (chain 71111)
  └── /api/pin     → Pinata IPFS (server-side, Cloudflare Function)
  └── /api/resolve → On-chain log query + IPFS fetch

Smart Contracts (Guapcoin EVM)
  ├── GuapDIDRegistry      — stores DID → IPFS CID mapping
  ├── GuapGovernanceToken  — GVOTE ERC-20 for DAO voting
  ├── GuapDAO              — proposal + voting governance
  ├── GuapValidatorRegistry— community business validator management
  └── GuapVerification     — privacy-preserving identity attestations

Deployment
  └── Cloudflare Pages (guapid.xyz)
```

---

## Smart Contracts

All contracts are deployed on Guapcoin mainnet (chain ID 71111):

| Contract | Address |
|----------|---------|
| GuapDIDRegistry | `0xb29a6cfa7f1789addbe2366e36eeb7cf1f2eb361` |
| GuapGovernanceToken (GVOTE) | `0x87f72004791c5c49d7077757bdf80b2cb116e335` |
| GuapDAO | `0x6239c8500746291d86d2ed17c6a1cdd13a5e8067` |
| GuapValidatorRegistry | `0xf76429313007aa218ce5134fb9ec87173fd431de` |
| GuapVerification | `0xea669b9ffdc71c891dd088d76e4f788efba28143` |

---

## Human Validators

Human Validators are real-world community businesses — shops, community centers, tribal offices, financial institutions — that verify identities in person and issue on-chain attestations.

**Accepted ID types:** Government ID, Tribal ID, Organizational ID, Passport

**Privacy model:** No ID data is stored on-chain. Only a hash and ID type category are recorded. The actual document never leaves the validator's hands.

**Becoming a validator:**
1. Submit a proposal at [guapid.xyz/validators/propose](https://guapid.xyz/validators/propose)
2. GVOTE holders vote on your proposal (7-day window, 1,000 GVOTE quorum)
3. If approved, you can begin issuing attestations

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero with Digital ID card |
| `/create` | Create a new DID |
| `/dashboard` | Manage your DID |
| `/update` | Update your DID Document |
| `/resolve` | Resolve any `did:guap:` address |
| `/validators` | Browse validators + vote on proposals |
| `/validators/propose` | Submit a validator application |
| `/docs` | Integration guide + API reference |

---

## API

### Resolve a DID (no auth required)

```
GET /api/resolve?did=did:guap:0x...
```

Returns W3C DID Resolution format with `didDocument`, `didDocumentMetadata`, and `anchorHistory`.

### OpenAPI Spec

```
GET /api/spec
```

---

## Local Development

```bash
cd guapid
npm install
cp .env.example .env   # fill in contract addresses
npm run dev
```

Requires MetaMask connected to Guapcoin network:
- **RPC:** `https://rpc-mainnet-1.guapcoinx.com`
- **Chain ID:** `71111`
- **Symbol:** `GUAP`

---

## Deploy Contracts

```bash
GUAPCOIN_PRIVATE_KEY=0x... node scripts/deploy-registry.mjs
GUAPCOIN_PRIVATE_KEY=0x... node scripts/deploy-dao.mjs
```

---

## Deploy to Cloudflare Pages

```bash
npm run build
wrangler pages deploy dist --project-name guapdid-xyz
```

Required Cloudflare Pages secrets:
- `PINATA_JWT`
- `VITE_REGISTRY_ADDRESS`
- `VITE_GVOTE_ADDRESS`
- `VITE_DAO_ADDRESS`
- `VITE_VALIDATOR_REGISTRY_ADDRESS`
- `VITE_VERIFICATION_ADDRESS`

---

## Tech Stack

- **Frontend:** Vite 5, React 18, TypeScript, Tailwind CSS v3, Framer Motion
- **Blockchain:** ethers.js v6, Guapcoin EVM (chain 71111)
- **Storage:** IPFS via Pinata
- **Hosting:** Cloudflare Pages + Functions
- **Identity Standard:** W3C DID Core 1.0

---

## License

MIT — see [../LICENSE](../LICENSE)
