import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, ExternalLink } from "lucide-react";
import { useDID } from "../hooks/useDID";
import DIDDocumentViewer from "../components/DIDDocumentViewer";
import GuapIDCard from "../components/GuapIDCard";
import Navbar from "../components/Navbar";

export default function Resolve() {
  const { did: paramDID } = useParams<{ did?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resolve, resolvedDID, resolving } = useDID();
  const [input, setInput] = useState(() => {
    const q = searchParams.get("did");
    if (q) return q;
    if (paramDID) return decodeURIComponent(paramDID);
    return "";
  });

  useEffect(() => {
    const initial = paramDID ? decodeURIComponent(paramDID) : searchParams.get("did");
    if (initial) {
      setInput(initial);
      resolve(initial);
    }
  }, []);

  const handleSearch = () => {
    if (!input.trim()) return;
    const did = input.trim().startsWith("did:guap:")
      ? input.trim()
      : `did:guap:${input.trim().toLowerCase()}`;
    resolve(did);
    navigate(`/resolve/${encodeURIComponent(did)}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-guap-black flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate("/")} className="btn-ghost flex items-center gap-1.5 text-sm mb-4 -ml-1 px-2 py-1">
            <ArrowLeft size={14} /> Home
          </button>
          <h1 className="text-2xl font-black text-white">Resolve DID</h1>
          <p className="text-sm text-guap-muted mt-1">
            Look up any did:guap identifier — no wallet required
          </p>
        </motion.div>

        {/* Search bar */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="did:guap:0x... or paste wallet address"
            className="input-field font-mono text-xs"
          />
          <button
            onClick={handleSearch}
            disabled={!input.trim() || resolving}
            className="btn-gold px-4 py-2 text-sm flex items-center gap-2 flex-shrink-0"
          >
            <Search size={14} />
            {resolving ? "Resolving..." : "Resolve"}
          </button>
        </div>

        {/* Result */}
        {resolving ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Search size={24} className="text-guap-gold animate-pulse mx-auto mb-3" />
            <p className="text-sm text-guap-muted">Resolving DID from Guapcoin blockchain...</p>
          </div>
        ) : resolvedDID ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="glass-gold rounded-2xl p-5">
              <div className="text-xs text-guap-muted uppercase tracking-wider font-semibold mb-2">Resolved DID</div>
              <div className="did-badge mb-3">{resolvedDID.didDocument.id}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-guap-dim mb-0.5">Block</div>
                  <div className="text-white font-mono">#{resolvedDID.blockNumber}</div>
                </div>
                <div>
                  <div className="text-guap-dim mb-0.5">Controller</div>
                  <div className="text-white font-mono">
                    {resolvedDID.controller.slice(0, 10)}...
                  </div>
                </div>
                <div>
                  <div className="text-guap-dim mb-0.5">Versions</div>
                  <div className="text-white">{resolvedDID.history.length}</div>
                </div>
              </div>
              <a
                href={`https://explorer.guapcoinx.com/tx/${resolvedDID.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-guap-gold hover:underline flex items-center gap-1 mt-3"
              >
                View anchor transaction <ExternalLink size={10} />
              </a>
            </div>

            <div className="glass rounded-2xl p-6">
              <DIDDocumentViewer
                document={resolvedDID.didDocument}
                cid={resolvedDID.cid}
                txHash={resolvedDID.txHash}
              />
            </div>

            {/* History */}
            {resolvedDID.history.length > 1 && (
              <div className="glass rounded-2xl p-5">
                <div className="text-xs text-guap-muted uppercase tracking-wider font-semibold mb-3">
                  Anchor History
                </div>
                <div className="space-y-2">
                  {resolvedDID.history.map((event, i) => (
                    <div key={event.txHash} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-guap-gold" : "bg-guap-dim"}`} />
                        <span className="text-guap-muted font-mono">Block #{event.blockNumber}</span>
                        {i === 0 && <span className="text-guap-gold font-semibold text-xs">current</span>}
                      </div>
                      <a
                        href={`https://explorer.guapcoinx.com/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-guap-gold hover:underline flex items-center gap-0.5"
                      >
                        {event.txHash.slice(0, 16)}... <ExternalLink size={9} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : input.trim() && !resolving ? (
          <div className="glass rounded-2xl p-10 text-center">
            <GuapIDCard size={80} className="mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-2">No DID Found</h3>
            <p className="text-sm text-guap-muted">
              No DID Document was found for this address on Guapcoin.
            </p>
          </div>
        ) : (
          <div className="glass rounded-2xl p-10 text-center">
            <GuapIDCard size={96} className="mx-auto mb-4" />
            <p className="text-sm text-guap-muted">
              Enter a did:guap DID or a Guapcoin wallet address to resolve its identity document.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
