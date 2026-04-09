import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { useDID } from "../hooks/useDID";
import { buildDIDDocument, emptyProfile, type ProfileFormData } from "../lib/didDocument";
import ProfileForm from "../components/ProfileForm";
import DIDDocumentViewer from "../components/DIDDocumentViewer";
import TransactionStatus from "../components/TransactionStatus";
import Navbar from "../components/Navbar";

const STEPS = [
  { num: "01", title: "Profile" },
  { num: "02", title: "Review" },
  { num: "03", title: "Anchor" },
];

export default function Create() {
  const { wallet } = useWallet();
  const { txState, submitDID, resetTx } = useDID();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileFormData>(emptyProfile());

  if (wallet.status !== "connected") {
    return (
      <div className="min-h-screen bg-guap-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-2xl mb-3">🔒</div>
            <h2 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-guap-muted">Please connect your Guapcoin wallet to create a DID.</p>
          </div>
        </div>
      </div>
    );
  }

  const { address } = wallet;
  const did = `did:guap:${address.toLowerCase()}`;
  const didDocument = buildDIDDocument(address, profile);

  const handleCreate = async () => {
    try {
      await submitDID(address, didDocument);
    } catch {
      // Error handled in txState
    }
  };

  const isSuccess = txState.status === "success";

  return (
    <div className="min-h-screen bg-guap-black flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button onClick={() => navigate("/")} className="btn-ghost flex items-center gap-1.5 text-sm mb-4 -ml-1 px-2 py-1">
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl font-black text-white">Create Your DID</h1>
          <p className="text-sm text-guap-muted mt-1">Anchor your decentralized identity on Guapcoin</p>
        </motion.div>

        {/* Step bar */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`step-indicator ${i < step ? "step-done" : i === step ? "step-active" : "step-pending"}`}>
                  {i < step ? <Check size={11} /> : s.num}
                </div>
                <span className={`text-xs font-semibold ${i === step ? "text-white" : "text-guap-dim"}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${i < step ? "bg-guap-gold" : "bg-guap-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl p-6 space-y-5"
            >
              <div>
                <div className="text-xs text-guap-muted uppercase tracking-wider font-semibold mb-1">Your DID</div>
                <div className="did-badge">{did}</div>
                <p className="text-xs text-guap-dim mt-2">All fields below are optional — you can create an empty DID and update later.</p>
              </div>
              <ProfileForm data={profile} onChange={setProfile} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="glass rounded-2xl p-6">
                <div className="text-xs text-guap-muted uppercase tracking-wider font-semibold mb-4">Preview DID Document</div>
                <DIDDocumentViewer document={didDocument} />
              </div>

              <div className="glass-gold rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-guap-gold flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white mb-1">This transaction is permanent</div>
                  <p className="text-xs text-guap-muted">
                    Anchoring your DID on Guapcoin is a public blockchain transaction. Your DID and profile data will be publicly visible and cannot be deleted. You can update it later.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="glass rounded-2xl p-6 space-y-4">
                <div>
                  <div className="text-xs text-guap-muted uppercase tracking-wider font-semibold mb-2">Transaction Summary</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-guap-muted">Action</span>
                      <span className="text-white font-medium">Create DID Document</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-guap-muted">Network</span>
                      <span className="text-white font-medium">Guapcoin (71111)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-guap-muted">DID</span>
                      <span className="text-guap-gold font-mono text-xs">{did.slice(0, 30)}...</span>
                    </div>
                  </div>
                </div>

                <TransactionStatus state={txState} onDismiss={resetTx} />

                {!isSuccess && (
                  <button
                    onClick={handleCreate}
                    disabled={txState.status === "pinning" || txState.status === "signing" || txState.status === "pending"}
                    className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
                  >
                    {txState.status === "idle" || txState.status === "error" ? (
                      <>Anchor on Guapcoin <ArrowRight size={14} /></>
                    ) : (
                      "Processing..."
                    )}
                  </button>
                )}

                {isSuccess && (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="btn-gold w-full py-3 text-sm"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => navigate(`/resolve/${encodeURIComponent(did)}`)}
                      className="btn-outline w-full py-3 text-sm"
                    >
                      View Resolved DID
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {!isSuccess && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-ghost px-4 py-2 text-sm flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Previous
            </button>
            {step < STEPS.length - 1 && (
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="btn-gold px-5 py-2 text-sm flex items-center gap-2"
              >
                Continue <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
