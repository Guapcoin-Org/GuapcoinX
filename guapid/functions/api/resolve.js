/**
 * Cloudflare Pages Function — GET /api/resolve?did=did:guap:0x...
 * Server-side did:guap resolver. Returns W3C DID Resolution format.
 */

const GUAPCOIN_RPC = "https://rpc-mainnet-1.guapcoinx.com";
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";
const REGISTRY_ADDRESS = "0xb29a6cfa7f1789addbe2366e36eeb7cf1f2eb361";

// DIDAttributeChanged(address indexed identity, bytes32 name, bytes value, uint validTo, uint previousChange)
const DID_ATTRIBUTE_CHANGED_TOPIC = "0x18ab7e1771a8c1e8222ede3f6e42f1b5d4d2ddfc01d7a82b3e7c3c0b0bff3c9";

// We'll query all DIDAttributeChanged events for the identity
async function getLogs(identity) {
  const paddedAddress = "0x000000000000000000000000" + identity.toLowerCase().replace("0x", "");
  const body = {
    jsonrpc: "2.0",
    method: "eth_getLogs",
    params: [{
      address: REGISTRY_ADDRESS,
      topics: [DID_ATTRIBUTE_CHANGED_TOPIC, paddedAddress],
      fromBlock: "0x0",
      toBlock: "latest",
    }],
    id: 1,
  };

  const res = await fetch(GUAPCOIN_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data.result || [];
}

function hexToUtf8(hex) {
  // Remove 0x prefix and dynamic offset/length encoding for bytes type
  // ABI-encoded bytes: 32 bytes offset + 32 bytes length + data
  let raw = hex.replace("0x", "");
  // The value field in DIDAttributeChanged is ABI-encoded bytes
  // Skip first 64 chars (32 byte offset) and next 64 chars (32 byte length)
  if (raw.length > 128) {
    const lengthHex = raw.slice(64, 128);
    const byteLength = parseInt(lengthHex, 16);
    const dataHex = raw.slice(128, 128 + byteLength * 2);
    let str = "";
    for (let i = 0; i < dataHex.length; i += 2) {
      str += String.fromCharCode(parseInt(dataHex.slice(i, i + 2), 16));
    }
    return str;
  }
  // Fallback: direct hex to utf8
  let str = "";
  for (let i = 0; i < raw.length; i += 2) {
    const code = parseInt(raw.slice(i, i + 2), 16);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str;
}

async function fetchIPFS(cid) {
  const res = await fetch(`${IPFS_GATEWAY}/${cid}`, {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`IPFS fetch failed: ${res.status}`);
  return res.json();
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Content-Type": "application/json",
  };
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  let did = url.searchParams.get("did") || "";

  if (!did) {
    return new Response(JSON.stringify({
      error: "Missing required parameter: did",
      example: "/api/resolve?did=did:guap:0x7f3a...",
    }), { status: 400, headers: corsHeaders() });
  }

  // Accept bare address too
  if (!did.startsWith("did:guap:")) {
    did = `did:guap:${did.toLowerCase()}`;
  }

  const parts = did.split(":");
  if (parts.length !== 3 || parts[0] !== "did" || parts[1] !== "guap") {
    return new Response(JSON.stringify({
      error: "Invalid DID format. Expected: did:guap:0x<address>",
    }), { status: 400, headers: corsHeaders() });
  }

  const identity = parts[2];
  if (!/^0x[0-9a-fA-F]{40}$/.test(identity)) {
    return new Response(JSON.stringify({
      error: "Invalid Ethereum address in DID",
    }), { status: 400, headers: corsHeaders() });
  }

  try {
    const logs = await getLogs(identity);

    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({
        didDocument: null,
        didDocumentMetadata: { deactivated: false },
        didResolutionMetadata: {
          error: "notFound",
          contentType: "application/did+ld+json",
          retrieved: new Date().toISOString(),
        },
      }), { status: 404, headers: corsHeaders() });
    }

    // Build history — sort by block number
    const history = logs.map(log => ({
      blockNumber: parseInt(log.blockNumber, 16),
      txHash: log.transactionHash,
      rawValue: log.data,
    })).sort((a, b) => a.blockNumber - b.blockNumber);

    // Latest is the last entry
    const latest = history[history.length - 1];
    const cid = hexToUtf8(latest.rawValue);

    if (!cid || !cid.startsWith("baf")) {
      return new Response(JSON.stringify({
        error: "Could not decode CID from on-chain data",
        raw: latest.rawValue,
      }), { status: 502, headers: corsHeaders() });
    }

    const didDocument = await fetchIPFS(cid);

    return new Response(JSON.stringify({
      didDocument,
      didDocumentMetadata: {
        created: didDocument.guap_profile?.created_at,
        updated: didDocument.guap_profile?.updated_at,
        versionId: cid,
        deactivated: false,
        versions: history.length,
      },
      didResolutionMetadata: {
        contentType: "application/did+ld+json",
        retrieved: new Date().toISOString(),
        txHash: latest.txHash,
        blockNumber: latest.blockNumber,
        network: "guapcoin",
        chainId: 71111,
      },
      anchorHistory: history.map(h => ({
        blockNumber: h.blockNumber,
        txHash: h.txHash,
      })),
    }), { status: 200, headers: corsHeaders() });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Resolution failed",
      message: err.message,
    }), { status: 502, headers: corsHeaders() });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}
