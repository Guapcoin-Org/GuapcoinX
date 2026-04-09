const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

export async function pinDIDDocument(document: object, walletAddress: string): Promise<string> {
  const response = await fetch("/api/pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document,
      walletAddress,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Pin failed: ${response.status}`);
  }

  const result = await response.json();
  return result.cid as string;
}

export async function fetchDIDDocument(cid: string): Promise<object> {
  const url = `${PINATA_GATEWAY}/${cid}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch IPFS document: ${response.status}`);
  return response.json();
}

export function ipfsUrl(cid: string): string {
  return `${PINATA_GATEWAY}/${cid}`;
}
