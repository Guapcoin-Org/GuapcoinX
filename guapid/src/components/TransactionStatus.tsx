import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import type { TxState } from "../hooks/useDID";

interface Props {
  state: TxState;
  onDismiss?: () => void;
}

export default function TransactionStatus({ state, onDismiss }: Props) {
  if (state.status === "idle") return null;

  const statusConfig = {
    pinning: {
      icon: <Loader2 size={20} className="text-guap-gold animate-spin" />,
      title: "Pinning to IPFS...",
      body: "Your DID Document is being stored on IPFS.",
      color: "rgba(245,168,0,0.1)",
      border: "rgba(245,168,0,0.25)",
    },
    signing: {
      icon: <Loader2 size={20} className="text-guap-gold animate-spin" />,
      title: "Awaiting Signature",
      body: "Please sign the transaction in your wallet.",
      color: "rgba(245,168,0,0.1)",
      border: "rgba(245,168,0,0.25)",
    },
    pending: {
      icon: <Loader2 size={20} className="text-blue-400 animate-spin" />,
      title: "Transaction Pending",
      body: "Waiting for Guapcoin confirmation...",
      color: "rgba(96,165,250,0.1)",
      border: "rgba(96,165,250,0.25)",
    },
    success: {
      icon: <CheckCircle size={20} className="text-green-400" />,
      title: "DID Anchored",
      body: "Your identity is now live on the Guapcoin blockchain.",
      color: "rgba(74,222,128,0.1)",
      border: "rgba(74,222,128,0.25)",
    },
    error: {
      icon: <XCircle size={20} className="text-red-400" />,
      title: "Transaction Failed",
      body: state.status === "error" ? state.message : "",
      color: "rgba(248,113,113,0.1)",
      border: "rgba(248,113,113,0.25)",
    },
  };

  const cfg = statusConfig[state.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 border flex items-start gap-3"
      style={{ background: cfg.color, borderColor: cfg.border }}
    >
      <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white mb-0.5">{cfg.title}</div>
        <div className="text-xs text-guap-muted">{cfg.body}</div>

        {state.status === "success" && (
          <div className="mt-2 space-y-1">
            <a
              href={`https://explorer.guapcoinx.com/tx/${state.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-guap-gold hover:underline flex items-center gap-1"
            >
              View on Explorer <ExternalLink size={10} />
            </a>
            <div className="text-xs font-mono text-guap-dim truncate">
              CID: {state.cid}
            </div>
          </div>
        )}
      </div>

      {(state.status === "success" || state.status === "error") && onDismiss && (
        <button
          onClick={onDismiss}
          className="btn-ghost text-xs px-2 py-1 flex-shrink-0"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}
