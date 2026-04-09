import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { useDID } from "../hooks/useDID";
import { buildDIDDocument, emptyProfile, type ProfileFormData } from "../lib/didDocument";
import ProfileForm from "../components/ProfileForm";
import TransactionStatus from "../components/TransactionStatus";
import DIDDocumentViewer from "../components/DIDDocumentViewer";
import Navbar from "../components/Navbar";

export default function Update() {
  const { wallet } = useWallet();
  const { txState, submitDID, resolve, resolvedDID, resetTx } = useDID();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileFormData>(emptyProfile());
  const [previewing, setPreviewing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (wallet.status !== "connected" || loaded) return;
    const did = `did:guap:${wallet.address.toLowerCase()}`;
    resolve(did).then((result) => {
      if (result?.didDocument?.guap_profile) {
        const p = result.didDocument.guap_profile;
        setProfile({
          displayName: p.display_name || "",
          hapCreatorId: p.hap_creator_id || "",
          website: p.social_links?.website || "",
          twitter: p.social_links?.twitter
            ? p.social_links.twitter.replace("https://twitter.com/", "")
            : "",
          description: (p as { description?: string }).description || "",
        });
      }
      setLoaded(true);
    });
  }, [wallet.status, loaded]);

  if (wallet.status !== "connected") {
    return (
      <div className="min-h-screen bg-guap-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center max-w-sm mx-4">
            <h2 className="text-lg font-bold text-white mb-2">Connect Wallet</h2>
            <p className="text-sm text-guap-muted">Connect your wallet to update your DID.</p>
          </div>
        </div>
      </div>
    );
  }

  const { address } = wallet;
  const existingCreatedAt = resolvedDID?.didDocument?.guap_profile?.created_at;
  const updatedDocument = buildDIDDocument(address, profile, existingCreatedAt);
  const isSuccess = txState.status === "success";

  const handleUpdate = async () => {
    try {
      await submitDID(address, updatedDocument);
    } catch {
      // Error in txState
    }
  };

  return (
    <div className="min-h-screen bg-guap-black flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate("/dashboard")} className="btn-ghost flex items-center gap-1.5 text-sm mb-4 -ml-1 px-2 py-1">
            <ArrowLeft size={14} /> Dashboard
          </button>
          <h1 className="text-2xl font-black text-white">Update DID</h1>
          <p className="text-sm text-guap-muted mt-1">
            Changes create a new version — all previous versions remain on IPFS
          </p>
        </motion.div>

        {!loaded ? (
          <div className="glass rounded-2xl p-10 text-center">
            <div className="text-guap-muted text-sm">Loading current profile...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <ProfileForm data={profile} onChange={setProfile} />
            </div>

            <button
              onClick={() => setPreviewing(!previewing)}
              className="btn-ghost text-sm px-3 py-2 flex items-center gap-1.5"
            >
              {previewing ? "Hide Preview" : "Preview DID Document"}
            </button>

            {previewing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glass rounded-2xl p-6"
              >
                <DIDDocumentViewer document={updatedDocument} />
              </motion.div>
            )}

            <TransactionStatus state={txState} onDismiss={resetTx} />

            {!isSuccess ? (
              <button
                onClick={handleUpdate}
                disabled={txState.status === "pinning" || txState.status === "signing" || txState.status === "pending"}
                className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                Update DID <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={() => navigate("/dashboard")} className="btn-gold w-full py-3 text-sm">
                Back to Dashboard
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
