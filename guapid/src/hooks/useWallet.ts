import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { GUAPCOIN_CHAIN_ID_HEX, ensureGuapcoinNetwork, toDID } from "../lib/chain";

export type WalletState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "wrong_network"; address: string }
  | { status: "connected"; address: string; did: string; signer: ethers.JsonRpcSigner }
  | { status: "error"; message: string };

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({ status: "disconnected" });

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setWallet({ status: "error", message: "No wallet detected. Please install MetaMask." });
      return;
    }

    setWallet({ status: "connecting" });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      if (!accounts.length) throw new Error("No accounts returned.");

      const address = accounts[0];
      const chainIdRaw = await window.ethereum.request({ method: "eth_chainId" });
      const chainIdHex = chainIdRaw as string;

      if (chainIdHex.toLowerCase() !== GUAPCOIN_CHAIN_ID_HEX.toLowerCase()) {
        setWallet({ status: "wrong_network", address });
        return;
      }

      const signer = await provider.getSigner();
      setWallet({ status: "connected", address, did: toDID(address), signer });
    } catch (err: unknown) {
      const msg = (err as Error).message || "Connection failed.";
      setWallet({ status: "error", message: msg });
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    try {
      await ensureGuapcoinNetwork();
      await connect();
    } catch (err: unknown) {
      setWallet({ status: "error", message: (err as Error).message || "Failed to switch network." });
    }
  }, [connect]);

  const disconnect = useCallback(() => {
    setWallet({ status: "disconnected" });
  }, []);

  // Auto-reconnect if already connected
  useEffect(() => {
    if (!window.ethereum) return;

    const tryAutoConnect = async () => {
      try {
        const eth = window.ethereum!;
        const provider = new ethers.BrowserProvider(eth as ethers.Eip1193Provider);
        const accounts: string[] = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          const chainIdRaw = await eth.request({ method: "eth_chainId" });
          const chainIdHex = chainIdRaw as string;
          const address = accounts[0];
          if (chainIdHex.toLowerCase() === GUAPCOIN_CHAIN_ID_HEX.toLowerCase()) {
            const signer = await provider.getSigner();
            setWallet({ status: "connected", address, did: toDID(address), signer });
          } else {
            setWallet({ status: "wrong_network", address });
          }
        }
      } catch {
        // Not connected, that's fine
      }
    };

    tryAutoConnect();

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts || accounts.length === 0) {
        setWallet({ status: "disconnected" });
      } else {
        connect();
      }
    };

    const handleChainChanged = () => {
      connect();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [connect]);

  return { wallet, connect, disconnect, switchNetwork };
}
