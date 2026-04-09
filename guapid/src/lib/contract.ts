import { ethers } from "ethers";
import { getRegistry, ensureGuapcoinNetwork, getSigner } from "./chain";
import { pinDIDDocument } from "./ipfs";
import type { DIDDocument } from "./didDocument";

export interface SetDIDResult {
  txHash: string;
  cid: string;
  blockNumber: number;
}

export async function createOrUpdateDID(
  walletAddress: string,
  didDocument: DIDDocument
): Promise<SetDIDResult> {
  await ensureGuapcoinNetwork();
  const signer = await getSigner();
  const registry = await getRegistry(signer);

  // Pin document to IPFS
  const cid = await pinDIDDocument(didDocument, walletAddress);

  // Encode the attribute name and value
  const name = ethers.encodeBytes32String("did/doc");
  const value = ethers.toUtf8Bytes(cid);
  const validity = 0; // No expiry

  const tx = await registry.setAttribute(walletAddress, name, value, validity);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    cid,
    blockNumber: receipt.blockNumber,
  };
}

export async function changeController(
  identity: string,
  newOwner: string
): Promise<{ txHash: string }> {
  await ensureGuapcoinNetwork();
  const signer = await getSigner();
  const registry = await getRegistry(signer);

  const tx = await registry.changeOwner(identity, newOwner);
  const receipt = await tx.wait();

  return { txHash: receipt.hash };
}

export async function hasDIDDocument(walletAddress: string): Promise<boolean> {
  if (!import.meta.env.VITE_REGISTRY_ADDRESS) return false;
  try {
    const provider = new ethers.JsonRpcProvider("https://rpc-mainnet-1.guapcoinx.com");
    const { REGISTRY_ABI, REGISTRY_ADDRESS } = await import("./chain");
    const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
    const filter = registry.filters.DIDAttributeChanged(walletAddress);
    const events = await registry.queryFilter(filter, 0, "latest");
    return events.length > 0;
  } catch {
    return false;
  }
}
