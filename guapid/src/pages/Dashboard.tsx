import { useState, useEffect } from "react";
import GuapIDCard from "../components/GuapIDCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Edit, ExternalLink, RefreshCw, Shield, Key, ShieldCheck, ShieldOff } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { useDID } from "../hooks/useDID";
import { formatAddress } from "../lib/chain";
import DIDDocumentViewer from "../components/DIDDocumentViewer";
import Navbar from "../components/Navbar";
import { isVerified, getAttestation, getApplication, ID_TYPE_LABELS } from "../lib/validators";

interface VerificationState {
  loading: boolean;
  verified: boolean;
  validatorName: string | null;
  idType: number | null;
}

export default function Dashboard() {
  const { wallet } = useWallet();
  const { resolve, resolvedDID, resolving } = useDID();
  const [copiedDID, setCopiedDID] = useState(false);
  const [verification, setVerification] = useState<VerificationState>({
    loading: true,
    verified: false,
    validatorName: null,
    idType: null,
  });

  useEffect(() => {
    if (wallet.status !== "connected") return;
    const did = `did:guap:${wallet.address.toLowerCase()}`;
    resolve(did);
  }, [wallet.status]);

  useEffect(() => {
    if (wallet.status !== "connected") {
      setVerification({ loading: false, verified: false, validatorName: null, idType: null });
      return;
    }
    const addr = wallet.address;
    setVerification((prev) => ({ ...prev, loading: true }));
    isVerified(addr)
      .then(async (verified) => {
        if (!verified) {
          setVerification({ loading: false, verified: false, validatorName: null, idType: null });
          return;
        }
        const attestation = await getAttestation(addr).catch(() => null);
        let validatorName: string | null = null;
        if (attestation?.validator) {
          const app = await getApplication(attestation.validator).catch(() => null);
          if (app?.ipfsCID) {
            try {
              const res = await fetch(`https://gateway.pinata.cloud/ipfs/${app.ipfsCID}`);
              if (res.ok) {
                const profile = await res.json() as { businessName?: string };
                validatorName = profile.businessName ?? null;
              }
            } catch { /* ignore */ }
          }
        }
        setVerification({
          loading: false,
          verified: true,
          validatorName,
          idType: attestation?.idType ?? null,
        });
      })
      .catch(() => {
        setVerification({ loading: false, verified: false, validatorName: null, idType: null });
      });
  }, [wallet.status, wallet.status === "connected" ? wallet.address : null]);

  if (wallet.status !== "connected") {
    return (
      <div className="min-h-screen bg-guap-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-2xl mb-3">🔒</div>
            <h2 className="text-lg font-bold text-white mb-2">Connect Wallet</h2>
            <p className="text-sm text-guap-muted">Connect your wallet to access your DID dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  const { address } = wallet;
  const did = `did:guap:${address.toLowerCase()}`;

  const copyDID = () => {
    navigator.clipboard.writeText(did);
    setCopiedDID(true);
    setTimeout(() => setCopiedDID(false), 1500);
  };

  return (
    <div className="min-h-screen bg-guap-black flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">My Identity</h1>
              <p className="text-sm text-guap-muted mt-0.5">
                {wallet.status === "connected" && formatAddress(address)} · Guapcoin
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => resolve(did)}
                disabled={resolving}
                className="btn-ghost p-2 rounded-xl"
                title="Refresh"
              >
                <RefreshCw size={15} className={resolving ? "animate-spin" : ""} />
              </button>
              <Link to="/update" className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5">
                <Edit size={12} /> Update
              </Link>
            </div>
          </div>
        </motion.div>

        {/* DID card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-gold rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-guap-gold" />
              <span className="text-xs font-bold text-guap-gold uppercase tracking-wider">Your DID</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyDID}
                className="text-xs text-guap-muted hover:text-guap-gold transition-colors flex items-center gap-1"
              >
                <Copy size={11} />
                {copiedDID ? "Copied!" : "Copy"}
              </button>
              <Link
                to={`/resolve/${encodeURIComponent(did)}`}
                className="text-xs text-guap-muted hover:text-guap-gold transition-colors flex items-center gap-1"
              >
                <ExternalLink size={11} />
                Resolve
              </Link>
            </div>
          </div>
          <div className="did-badge">{did}</div>
        </motion.div>

        {/* Verification Status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-6"
        >
          {verification.loading ? (
            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <RefreshCw size={14} className="text-guap-gold animate-spin" />
              <span className="text-xs text-guap-muted">Checking verification status...</span>
            </div>
          ) : verification.verified ? (
            <div
              className="glass rounded-2xl p-4 flex items-center justify-between"
              style={{ border: "1px solid rgba(74,222,128,0.25)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)" }}
                >
                  <ShieldCheck size={16} className="text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                    Verified Identity
                  </div>
                  <div className="text-xs text-guap-muted">
                    {verification.idType !== null && ID_TYPE_LABELS[verification.idType]
                      ? ID_TYPE_LABELS[verification.idType]
                      : "Verified"}{" "}
                    {verification.validatorName ? `· ${verification.validatorName}` : ""}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}
                >
                  <ShieldOff size={16} className="text-guap-gold" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Not Verified</div>
                  <div className="text-xs text-guap-muted">Visit a Human Validator to verify your identity in person.</div>
                </div>
              </div>
              <Link to="/validators" className="btn-gold text-xs px-3 py-1.5 flex-shrink-0">
                Get Verified
              </Link>
            </div>
          )}
        </motion.div>

        {/* Content */}
        {resolving ? (
          <div className="glass rounded-2xl p-12 text-center">
            <RefreshCw size={24} className="text-guap-gold animate-spin mx-auto mb-3" />
            <p className="text-sm text-guap-muted">Resolving your DID...</p>
          </div>
        ) : resolvedDID ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">DID Document</h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-xs text-green-400">Active</span>
              </div>
            </div>
            <DIDDocumentViewer
              document={resolvedDID.didDocument}
              cid={resolvedDID.cid}
              txHash={resolvedDID.txHash}
            />

            {/* History */}
            {resolvedDID.history.length > 1 && (
              <div>
                <div className="text-xs text-guap-muted uppercase tracking-wider font-semibold mb-3">
                  Update History ({resolvedDID.history.length} versions)
                </div>
                <div className="space-y-2">
                  {resolvedDID.history.slice(0, 5).map((event, i) => (
                    <div key={event.txHash} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-guap-gold" : "bg-guap-dim"}`} />
                        <span className="text-guap-muted font-mono">Block #{event.blockNumber}</span>
                        {i === 0 && <span className="text-guap-gold font-semibold">current</span>}
                      </div>
                      <a
                        href={`https://explorer.guapcoinx.com/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-guap-gold hover:underline flex items-center gap-0.5"
                      >
                        {event.txHash.slice(0, 14)}... <ExternalLink size={9} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controller */}
            <div className="flex items-center justify-between border-t border-guap-border pt-4">
              <div className="flex items-center gap-2 text-xs text-guap-muted">
                <Key size={12} />
                Controller: <span className="font-mono text-white">{formatAddress(resolvedDID.controller)}</span>
              </div>
              <Link to="/update" className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Edit size={11} /> Update Profile
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <GuapIDCard size={88} className="mx-auto mb-4" />
            <h3 className="text-base font-bold text-white mb-2">No DID Document Found</h3>
            <p className="text-sm text-guap-muted mb-5">
              You haven't created a DID yet. Create one to anchor your identity on Guapcoin.
            </p>
            <Link to="/create" className="btn-gold px-6 py-2.5 text-sm inline-flex items-center gap-2">
              Create DID
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
