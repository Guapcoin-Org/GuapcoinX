import { ethers } from "ethers";
import { GUAPCOIN_CHAIN_ID, REGISTRY_ABI, REGISTRY_ADDRESS } from "./chain";
import { fetchDIDDocument, ipfsUrl } from "./ipfs";
import type { DIDDocument } from "./didDocument";

export interface ResolvedDID {
  didDocument: DIDDocument;
  didDocumentMetadata: {
    created?: string;
    updated?: string;
    versionId: string;
    deactivated: boolean;
  };
  didResolutionMetadata: {
    contentType: string;
    retrieved: string;
    txHash?: string;
    blockNumber?: number;
  };
  cid: string;
  txHash: string;
  blockNumber: number;
  controller: string;
  history: AnchorEvent[];
}

export interface AnchorEvent {
  cid: string;
  txHash: string;
  blockNumber: number;
  timestamp?: string;
}

const RPC_URL = "https://rpc-mainnet-1.guapcoinx.com";

export async function resolveDID(did: string): Promise<ResolvedDID | null> {
  if (!REGISTRY_ADDRESS) return null;

  const addressPart = did.split(":")[2];
  if (!addressPart || !ethers.isAddress(addressPart)) return null;

  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: GUAPCOIN_CHAIN_ID,
    name: "guapcoin",
  });

  const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);

  try {
    const filter = registry.filters.DIDAttributeChanged(addressPart);
    const events = await registry.queryFilter(filter, 0, "latest");

    if (events.length === 0) return null;

    const history: AnchorEvent[] = [];
    let latestCid = "";
    let latestTxHash = "";
    let latestBlock = 0;

    for (const event of events) {
      const log = event as ethers.EventLog;
      const value = log.args[2] as string;
      const cid = ethers.toUtf8String(value);
      const block = log.blockNumber;

      history.push({
        cid,
        txHash: log.transactionHash,
        blockNumber: block,
      });

      if (block > latestBlock) {
        latestBlock = block;
        latestCid = cid;
        latestTxHash = log.transactionHash;
      }
    }

    history.reverse();

    const didDocument = await fetchDIDDocument(latestCid) as DIDDocument;
    const controller = await registry.identityOwner(addressPart) as string;

    return {
      didDocument,
      didDocumentMetadata: {
        versionId: latestCid,
        deactivated: false,
        created: didDocument.guap_profile?.created_at,
        updated: didDocument.guap_profile?.updated_at,
      },
      didResolutionMetadata: {
        contentType: "application/did+ld+json",
        retrieved: new Date().toISOString(),
        txHash: latestTxHash,
        blockNumber: latestBlock,
      },
      cid: latestCid,
      txHash: latestTxHash,
      blockNumber: latestBlock,
      controller,
      history,
    };
  } catch (err) {
    console.error("Resolver error:", err);
    return null;
  }
}

export function cidToIPFSUrl(cid: string): string {
  return ipfsUrl(cid);
}
