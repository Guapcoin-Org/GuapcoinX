import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Copy, Terminal, Globe, Shield, Link2, Users, ShieldCheck, Vote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";

function CodeSnippet({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="code-block my-3">
      <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
          {label && <span className="text-xs font-mono ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>}
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="text-xs flex items-center gap-1 transition-colors"
          style={{ color: copied ? "#00FF00" : "rgba(255,255,255,0.4)" }}
        >
          <Copy size={11} /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-5 text-xs font-mono overflow-x-auto leading-relaxed" style={{ color: "#86efac" }}>{code}</pre>
    </div>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      id={id}
      className="glass rounded-2xl p-7 mb-5"
    >
      <h2 className="text-lg font-bold text-white mb-4" style={{ color: "#FFD700" }}>{title}</h2>
      <div className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.7" }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function Docs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)" }}>
      <Navbar />
      <main className="flex-1 max-w-[860px] mx-auto w-full px-4 sm:px-6 py-10">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <button onClick={() => navigate("/")} className="btn-ghost flex items-center gap-1.5 text-sm mb-5 -ml-1 px-2 py-1">
            <ArrowLeft size={14} /> Home
          </button>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-mono"
            style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", color: "#FFD700" }}>
            <Terminal size={11} /> API v1.0
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Integration Guide</h1>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>
            Integrate did:guap decentralized identity into your platform.
          </p>
        </motion.div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["Overview", "Resolver API", "DID Format", "JavaScript SDK", "HAP Integration", "Network", "Human Validators"].map(label => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              className="credential-badge hover:opacity-80 transition-opacity text-xs"
            >
              {label}
            </a>
          ))}
        </div>

        <Section title="Overview" id="overview">
          <p>
            GuapDID implements the <a href="https://www.w3.org/TR/did-core/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-0.5">W3C DID Core 1.0 <ExternalLink size={10} /></a> specification
            on the Guapcoin blockchain. A did:guap identifier is derived directly from a Guapcoin wallet address — no registration required to create the identifier itself.
          </p>
          <p>Registration anchors a DID Document on-chain via the <strong className="text-white">GuapDIDRegistry</strong> smart contract, making it resolvable by any platform.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[
              { icon: <Globe size={14} />, label: "Resolver API", val: "guapid.xyz/api/resolve" },
              { icon: <Shield size={14} />, label: "Registry Contract", val: "0xb29a...b361" },
              { icon: <Link2 size={14} />, label: "Chain ID", val: "71111 (Guapcoin)" },
            ].map(item => (
              <div key={item.label} className="stat-item">
                <div className="flex items-center gap-1.5 mb-1" style={{ color: "#FFD700" }}>
                  {item.icon}
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
                <div className="text-xs font-mono text-white">{item.val}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Resolver API" id="resolver-api">
          <p>Resolve any did:guap identifier with a single HTTP GET. No API key required.</p>

          <CodeSnippet label="request" code={`GET https://guapid.xyz/api/resolve?did=did:guap:0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8

# Also accepts bare wallet address:
GET https://guapid.xyz/api/resolve?did=0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8`} />

          <CodeSnippet label="response.json" code={`{
  "didDocument": {
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": "did:guap:0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
    "verificationMethod": [{
      "id": "did:guap:0x7f3a...#controller",
      "type": "EcdsaSecp256k1RecoveryMethod2020",
      "controller": "did:guap:0x7f3a...",
      "blockchainAccountId": "eip155:71111:0x7f3a..."
    }],
    "authentication": ["did:guap:0x7f3a...#controller"],
    "guap_profile": {
      "display_name": "Jordan Ellis",
      "hap_creator_id": "hap_creator_001",
      "created_at": "2026-01-01T00:00:00Z"
    }
  },
  "didDocumentMetadata": {
    "versionId": "bafybeig...",
    "deactivated": false,
    "versions": 1
  },
  "didResolutionMetadata": {
    "contentType": "application/did+ld+json",
    "retrieved": "2026-04-09T00:00:00Z",
    "txHash": "0xabc123...",
    "blockNumber": 1553434,
    "network": "guapcoin",
    "chainId": 71111
  }
}`} />

          <p className="mt-2">
            Full OpenAPI 3.1 spec available at{" "}
            <a href="/api/spec" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-0.5">
              /api/spec <ExternalLink size={10} />
            </a>
          </p>
        </Section>

        <Section title="DID Format" id="did-format">
          <p>The did:guap method derives identifiers directly from Guapcoin wallet addresses:</p>
          <CodeSnippet code={`did:guap:<guapcoin-wallet-address>

// Examples:
did:guap:0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8
did:guap:0xbc066f5377bf2b95d3ca7462ff590e3ae7505f6b`} />
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>The wallet address <strong className="text-white">is</strong> the identifier — deterministic, no registration required</li>
            <li>Registration anchors a DID Document, making it resolvable</li>
            <li>The controller key is the private key of the wallet address</li>
            <li>Key rotation is supported via <code className="text-xs bg-white/5 px-1 rounded">changeOwner()</code> on the registry contract</li>
          </ul>
        </Section>

        <Section title="JavaScript SDK" id="javascript-sdk">
          <p>Resolve a did:guap DID from any JavaScript/TypeScript application:</p>

          <CodeSnippet label="resolve.ts" code={`// No SDK needed — plain fetch
async function resolveGuapDID(did: string) {
  const res = await fetch(
    \`https://guapid.xyz/api/resolve?did=\${encodeURIComponent(did)}\`
  );
  if (!res.ok) return null;
  return res.json();
}

// Usage
const result = await resolveGuapDID(
  "did:guap:0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"
);

const { didDocument, didResolutionMetadata } = result;
const profile = didDocument.guap_profile;
console.log(profile.display_name); // "Jordan Ellis"
console.log(profile.hap_creator_id); // "hap_creator_001"`} />

          <p className="mt-2">Verify wallet ownership (signature verification):</p>
          <CodeSnippet label="verify.ts" code={`import { ethers } from "ethers";

async function verifyGuapIdentity(
  did: string,
  message: string,
  signature: string
): Promise<boolean> {
  const address = did.replace("did:guap:", "");
  const recovered = ethers.verifyMessage(message, signature);
  return recovered.toLowerCase() === address.toLowerCase();
}

// Challenge-response flow:
// 1. Platform generates a nonce: "Sign this to verify: abc123"
// 2. User signs with MetaMask: wallet.signMessage(nonce)
// 3. Platform verifies: verifyGuapIdentity(did, nonce, signature)`} />
        </Section>

        <Section title="HAP Integration" id="hap-integration">
          <p>
            GuapDID and <a href="https://haphuman.xyz" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-0.5">HAP (Human Authorship Protocol) <ExternalLink size={10} /></a> are
            designed to work together. A creator's HAP records link to their did:guap identity — proving that a wallet address
            belongs to the creator of specific AI-assisted works.
          </p>

          <p className="mt-2">Link a HAP Creator ID in a DID Document:</p>
          <CodeSnippet label="did-document.json" code={`{
  "id": "did:guap:0x7f3a...",
  "service": [
    {
      "id": "did:guap:0x7f3a...#hap-profile",
      "type": "HAPCreatorProfile",
      "serviceEndpoint": "https://haphuman.xyz/creator/hap_creator_001"
    }
  ],
  "guap_profile": {
    "hap_creator_id": "hap_creator_001"
  }
}`} />

          <p>Resolve a creator's HAP profile from their DID:</p>
          <CodeSnippet label="hap-lookup.ts" code={`async function getHAPProfileFromDID(did: string) {
  const resolution = await resolveGuapDID(did);
  if (!resolution?.didDocument) return null;

  const hapId = resolution.didDocument.guap_profile?.hap_creator_id;
  if (!hapId) return null;

  // Fetch HAP creator records
  const hapRes = await fetch(
    \`https://haphuman.xyz/api/v1/creator/\${hapId}\`
  );
  return hapRes.json();
}`} />

          <div className="rounded-xl p-4 mt-3" style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)" }}>
            <div className="text-xs font-semibold mb-1" style={{ color: "#FFD700" }}>HAP + GuapDID flow</div>
            <div className="text-xs space-y-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              <div>1. Creator registers a HAP record on <strong className="text-white">haphuman.xyz</strong></div>
              <div>2. Creator creates a did:guap DID with their <code className="text-xs bg-white/5 px-1 rounded">hap_creator_id</code> linked</div>
              <div>3. Platforms resolve the DID → get HAP profile → verify all authorship records belong to this wallet</div>
              <div>4. No centralized account or login required at any step</div>
            </div>
          </div>
        </Section>

        <Section title="Network" id="network">
          <p>Add the Guapcoin network to MetaMask or any EVM wallet:</p>
          <CodeSnippet label="add-network.ts" code={`await window.ethereum.request({
  method: "wallet_addEthereumChain",
  params: [{
    chainId: "0x115E7",        // 71111 in hex
    chainName: "Guapcoin",
    nativeCurrency: {
      name: "Guapcoin",
      symbol: "GUAP",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-mainnet-1.guapcoinx.com"],
    blockExplorerUrls: ["https://explorer.guapcoinx.com"],
  }],
});`} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {[
              { label: "Chain ID", val: "71111" },
              { label: "Symbol", val: "GUAP" },
              { label: "Decimals", val: "18" },
              { label: "Registry", val: "0xb29a...b361" },
            ].map(item => (
              <div key={item.label} className="stat-item text-center">
                <div className="stat-label mb-1">{item.label}</div>
                <div className="stat-value text-sm">{item.val}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Human Validators &amp; DAO" id="human-validators">
          <p>
            GuapID implements a three-tier identity model, allowing users to choose their
            level of privacy and verifiability:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 mb-3">
            {[
              {
                icon: <Shield size={14} />,
                label: "Pseudonymous",
                val: "Wallet address only — no personal data on-chain.",
              },
              {
                icon: <Users size={14} />,
                label: "Social Proof",
                val: "DID Document anchored with public profile fields.",
              },
              {
                icon: <ShieldCheck size={14} />,
                label: "Human Verified",
                val: "On-chain attestation from an approved Human Validator.",
              },
            ].map((item) => (
              <div key={item.label} className="stat-item">
                <div className="flex items-center gap-1.5 mb-1" style={{ color: "#FFD700" }}>
                  {item.icon}
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{item.val}</div>
              </div>
            ))}
          </div>

          <p className="font-semibold text-white mt-2">Validator Onboarding Flow</p>
          <div className="rounded-xl p-4 mt-2" style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)" }}>
            <div className="text-xs space-y-2" style={{ color: "rgba(255,255,255,0.55)" }}>
              <div>
                <strong className="text-white">1. Apply</strong> — A community business submits a validator
                profile (business name, location, accepted ID types) pinned to IPFS. The IPFS CID is stored
                on <code className="text-xs bg-white/5 px-1 rounded">GuapValidatorRegistry</code> via
                {" "}<code className="text-xs bg-white/5 px-1 rounded">submitApplication(cid)</code>.
              </div>
              <div>
                <strong className="text-white">2. DAO Vote</strong> — GVOTE holders vote on a
                {" "}<code className="text-xs bg-white/5 px-1 rounded">GuapDAO</code> proposal that calls
                {" "}<code className="text-xs bg-white/5 px-1 rounded">approveValidator(address)</code>.
                Voting period is 40,320 blocks (~7 days). Quorum is 1,000 GVOTE.
              </div>
              <div>
                <strong className="text-white">3. Approved</strong> — The validator is listed on-chain and
                can begin issuing attestations at their physical location.
              </div>
              <div>
                <strong className="text-white">4. Removal</strong> — The DAO can remove a validator at any
                time via <code className="text-xs bg-white/5 px-1 rounded">removeValidator(address)</code>.
              </div>
            </div>
          </div>

          <p className="font-semibold text-white mt-4">Attestation Privacy Model</p>
          <div className="rounded-xl p-4 mt-2" style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)" }}>
            <div className="text-xs space-y-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              <div><strong className="text-white">On-chain (public):</strong> validator address, ID category (e.g. GOVERNMENT_ID), timestamp, a <code className="text-xs bg-white/5 px-1 rounded">bytes32</code> hash.</div>
              <div><strong className="text-white">Off-chain (never stored):</strong> the actual ID document, name, date of birth, document number — nothing personal touches the blockchain.</div>
              <div><strong className="text-white">Hash:</strong> computed locally by the validator, e.g. <code className="text-xs bg-white/5 px-1 rounded">keccak256(abi.encodePacked(docType, docId, walletAddress))</code> — links the verification to the wallet without revealing the document.</div>
            </div>
          </div>

          <p className="font-semibold text-white mt-4">DAO Governance Mechanics</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 mb-3">
            {[
              { label: "Token", val: "GVOTE" },
              { label: "Voting Period", val: "40,320 blocks" },
              { label: "Quorum", val: "1,000 GVOTE" },
              { label: "Threshold", val: "100 GVOTE" },
            ].map((item) => (
              <div key={item.label} className="stat-item text-center">
                <div className="stat-label mb-1">{item.label}</div>
                <div className="stat-value text-sm">{item.val}</div>
              </div>
            ))}
          </div>

          <p>
            Any address holding at least 100 GVOTE can submit a proposal targeting any contract,
            including <code className="text-xs bg-white/5 px-1 rounded">GuapValidatorRegistry</code>.
            Once a proposal passes (for votes &gt; against votes, above quorum), anyone can call
            {" "}<code className="text-xs bg-white/5 px-1 rounded">execute(proposalId)</code> to
            trigger the on-chain action.
          </p>

          <p className="font-semibold text-white mt-4">Check Verification Status</p>
          <CodeSnippet label="verify-status.ts" code={`// Check if a wallet is human-verified
const VERIFICATION_ABI = [
  "function isVerified(address identity) external view returns (bool)",
  "function getAttestation(address identity) external view returns (address validator, uint8 idType, uint256 timestamp, bool valid)",
];

async function checkVerification(walletAddress: string) {
  const provider = new ethers.JsonRpcProvider(
    "https://rpc-mainnet-1.guapcoinx.com"
  );
  const contract = new ethers.Contract(
    process.env.VERIFICATION_ADDRESS,
    VERIFICATION_ABI,
    provider
  );

  const verified = await contract.isVerified(walletAddress);
  if (!verified) return { verified: false };

  const [validator, idType, timestamp, valid] = await contract.getAttestation(walletAddress);
  const ID_TYPES = ["Government ID", "Tribal ID", "Organizational ID", "Passport", "Other"];

  return {
    verified: true,
    validator,
    idType: ID_TYPES[idType] ?? "Unknown",
    verifiedAt: new Date(Number(timestamp) * 1000).toISOString(),
  };
}

// Example response:
// { verified: true, validator: "0xabc...", idType: "Tribal ID", verifiedAt: "2026-04-09T..." }`} />

          <div className="rounded-xl p-4 mt-3" style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)" }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: "#FFD700" }}>
              <Vote size={13} />
              <span className="text-xs font-semibold">Become a Validator</span>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              Community businesses can apply at{" "}
              <a href="/validators/propose" className="text-gold hover:underline">/validators/propose</a>.
              Applications require a GVOTE community vote before approval.
            </p>
          </div>
        </Section>

      </main>
    </div>
  );
}
