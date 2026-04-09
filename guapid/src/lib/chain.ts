import { ethers } from "ethers";

export const GUAPCOIN_CHAIN_ID = 71111;
export const GUAPCOIN_CHAIN_ID_HEX = "0x" + GUAPCOIN_CHAIN_ID.toString(16);

export const GUAPCOIN_NETWORK_PARAMS = {
  chainId: GUAPCOIN_CHAIN_ID_HEX,
  chainName: "Guapcoin",
  nativeCurrency: {
    name: "Guapcoin",
    symbol: "GUAP",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-mainnet-1.guapcoinx.com"],
  blockExplorerUrls: ["https://explorer.guapcoinx.com"],
};

export const REGISTRY_ADDRESS = import.meta.env.VITE_REGISTRY_ADDRESS as string || "";

export const REGISTRY_ABI = [
  "event DIDAttributeChanged(address indexed identity, bytes32 name, bytes value, uint validTo, uint previousChange)",
  "event DIDOwnerChanged(address indexed identity, address owner, uint previousChange)",
  "event DIDDelegateChanged(address indexed identity, bytes32 delegateType, address delegate, uint validTo, uint previousChange)",
  "function changed(address) view returns (uint)",
  "function owners(address) view returns (address)",
  "function identityOwner(address identity) view returns (address)",
  "function setAttribute(address identity, bytes32 name, bytes value, uint validity) external",
  "function changeOwner(address identity, address newOwner) external",
  "function addDelegate(address identity, bytes32 delegateType, address delegate, uint validity) external",
  "function revokeDelegate(address identity, bytes32 delegateType, address delegate) external",
  "function revokeAttribute(address identity, bytes32 name, bytes value) external",
];

export async function getProvider(): Promise<ethers.BrowserProvider> {
  if (!window.ethereum) throw new Error("No wallet detected. Please install MetaMask.");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner(): Promise<ethers.JsonRpcSigner> {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getRegistry(signer: ethers.JsonRpcSigner): Promise<ethers.Contract> {
  if (!REGISTRY_ADDRESS) throw new Error("Registry contract address not configured.");
  return new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
}

export async function getReadRegistry(provider: ethers.BrowserProvider | ethers.JsonRpcProvider): Promise<ethers.Contract> {
  if (!REGISTRY_ADDRESS) throw new Error("Registry contract address not configured.");
  return new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
}

export async function ensureGuapcoinNetwork(): Promise<void> {
  if (!window.ethereum) throw new Error("No wallet detected.");
  const chainIdHex = (await window.ethereum.request({ method: "eth_chainId" })) as string;
  if (chainIdHex.toLowerCase() !== GUAPCOIN_CHAIN_ID_HEX.toLowerCase()) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: GUAPCOIN_CHAIN_ID_HEX }],
      });
    } catch (switchErr: unknown) {
      if ((switchErr as { code?: number }).code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [GUAPCOIN_NETWORK_PARAMS],
        });
      } else {
        throw switchErr;
      }
    }
  }
}

export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function toDID(address: string): string {
  return `did:guap:${address.toLowerCase()}`;
}

export function fromDID(did: string): string {
  const parts = did.split(":");
  if (parts.length !== 3 || parts[0] !== "did" || parts[1] !== "guap") {
    throw new Error(`Invalid did:guap DID: ${did}`);
  }
  return parts[2];
}
