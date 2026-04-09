import { useState, useCallback } from "react";
import { createOrUpdateDID } from "../lib/contract";
import { resolveDID } from "../lib/resolver";
import type { DIDDocument } from "../lib/didDocument";
import type { ResolvedDID } from "../lib/resolver";

export type TxState =
  | { status: "idle" }
  | { status: "pinning" }
  | { status: "signing" }
  | { status: "pending"; txHash: string }
  | { status: "success"; txHash: string; cid: string; blockNumber: number }
  | { status: "error"; message: string };

export function useDID() {
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [resolvedDID, setResolvedDID] = useState<ResolvedDID | null>(null);
  const [resolving, setResolving] = useState(false);

  const submitDID = useCallback(async (walletAddress: string, document: DIDDocument) => {
    setTxState({ status: "pinning" });

    try {
      setTxState({ status: "signing" });
      const result = await createOrUpdateDID(walletAddress, document);
      setTxState({ status: "success", ...result });
      return result;
    } catch (err: unknown) {
      const msg = (err as Error).message || "Transaction failed.";
      setTxState({ status: "error", message: msg });
      throw err;
    }
  }, []);

  const resolve = useCallback(async (did: string) => {
    setResolving(true);
    try {
      const result = await resolveDID(did);
      setResolvedDID(result);
      return result;
    } finally {
      setResolving(false);
    }
  }, []);

  const resetTx = useCallback(() => {
    setTxState({ status: "idle" });
  }, []);

  return { txState, submitDID, resolvedDID, resolve, resolving, resetTx };
}
