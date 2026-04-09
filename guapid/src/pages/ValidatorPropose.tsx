import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Building2, AlertTriangle, RefreshCw } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { getSigner } from "../lib/chain";
import { submitApplication, ID_TYPE_LABELS } from "../lib/validators";
import Navbar from "../components/Navbar";
import GoldParticles from "../components/GoldParticles";

// ─── Types ────────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "Retail Store",
  "Community Organization",
  "Tribal Office",
  "Financial Institution",
  "Healthcare Provider",
  "Other",
] as const;

type BusinessType = (typeof BUSINESS_TYPES)[number];

interface ProposalFormData {
  businessName: string;
  businessType: BusinessType | "";
  address: string;
  city: string;
  state: string;
  country: string;
  acceptedIdTypes: number[];
  contactEmail: string;
  website: string;
  about: string;
}

const EMPTY_FORM: ProposalFormData = {
  businessName: "",
  businessType: "",
  address: "",
  city: "",
  state: "",
  country: "",
  acceptedIdTypes: [],
  contactEmail: "",
  website: "",
  about: "",
};

type TxStatus = "idle" | "pinning" | "submitting" | "success" | "error";

const STEPS = [
  { num: "01", title: "Profile" },
  { num: "02", title: "Review & Submit" },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep1(form: ProposalFormData): string | null {
  if (!form.businessName.trim()) return "Business name is required.";
  if (!form.businessType) return "Business type is required.";
  if (!form.city.trim()) return "City is required.";
  if (!form.country.trim()) return "Country is required.";
  if (form.acceptedIdTypes.length === 0) return "Select at least one accepted ID type.";
  if (!form.contactEmail.trim()) return "Contact email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) return "Invalid email address.";
  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ValidatorPropose() {
  const { wallet } = useWallet();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProposalFormData>(EMPTY_FORM);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txError, setTxError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const updateField = <K extends keyof ProposalFormData>(
    key: K,
    value: ProposalFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldError(null);
  };

  const toggleIdType = (type: number) => {
    setForm((prev) => {
      const has = prev.acceptedIdTypes.includes(type);
      return {
        ...prev,
        acceptedIdTypes: has
          ? prev.acceptedIdTypes.filter((t) => t !== type)
          : [...prev.acceptedIdTypes, type],
      };
    });
    setFieldError(null);
  };

  const goNext = () => {
    const err = validateStep1(form);
    if (err) { setFieldError(err); return; }
    setFieldError(null);
    setStep(1);
  };

  const handleSubmit = async () => {
    if (wallet.status !== "connected") return;
    setTxError(null);
    setTxStatus("pinning");

    try {
      // Build profile document for IPFS
      const profileDoc = {
        businessName: form.businessName,
        businessType: form.businessType,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        acceptedIdTypes: form.acceptedIdTypes,
        contactEmail: form.contactEmail,
        website: form.website || undefined,
        about: form.about || undefined,
        submittedAt: Math.floor(Date.now() / 1000),
        submittedBy: wallet.address,
        schema: "GuapIDValidatorProfile/v1",
      };

      // Pin to IPFS via existing /api/pin endpoint
      const pinRes = await fetch("/api/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: profileDoc, walletAddress: wallet.address }),
      });
      if (!pinRes.ok) {
        const err = await pinRes.json().catch(() => ({ error: "Pin failed" }));
        throw new Error((err as { error?: string }).error ?? "IPFS pin failed");
      }
      const { cid } = (await pinRes.json()) as { cid: string };

      setTxStatus("submitting");
      const signer = await getSigner();
      const hash = await submitApplication(signer, cid);
      setTxHash(hash);
      setTxStatus("success");
    } catch (err: unknown) {
      setTxStatus("error");
      setTxError(err instanceof Error ? err.message : "Submission failed");
    }
  };

  if (wallet.status !== "connected") {
    return (
      <div className="min-h-screen bg-guap-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center max-w-sm mx-4">
            <Building2 size={32} className="text-guap-gold mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-guap-muted">
              Connect your Guapcoin wallet to submit a validator application.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-guap-black flex flex-col relative overflow-hidden">
      <GoldParticles />
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate("/validators")} className="btn-ghost flex items-center gap-1.5 text-sm mb-4 -ml-1 px-2 py-1">
            <ArrowLeft size={14} /> Validators
          </button>
          <h1 className="text-2xl font-black text-white">Propose Your Business</h1>
          <p className="text-sm text-guap-muted mt-1">
            Submit your application to become a Human Validator for GuapID
          </p>
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

        {/* Field error */}
        {fieldError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-400"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle size={14} />
            {fieldError}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Step 0: Form ── */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-2xl p-6 space-y-5"
            >

              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-1.5">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  placeholder="e.g. Guap Community Center"
                  className="w-full bg-transparent rounded-xl px-4 py-2.5 text-sm text-white placeholder-guap-dim focus:outline-none"
                  style={{ border: "1px solid rgba(255,215,0,0.2)" }}
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-1.5">
                  Business Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.businessType}
                  onChange={(e) => updateField("businessType", e.target.value as BusinessType)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.2)" }}
                >
                  <option value="" disabled>Select type...</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-1.5">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Street address"
                  className="w-full bg-transparent rounded-xl px-4 py-2.5 text-sm text-white placeholder-guap-dim focus:outline-none"
                  style={{ border: "1px solid rgba(255,215,0,0.2)" }}
                />
              </div>

              {/* City / State / Country */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-1.5">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="City"
                    className="w-full bg-transparent rounded-xl px-3 py-2.5 text-sm text-white placeholder-guap-dim focus:outline-none"
                    style={{ border: "1px solid rgba(255,215,0,0.2)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-1.5">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="State"
                    className="w-full bg-transparent rounded-xl px-3 py-2.5 text-sm text-white placeholder-guap-dim focus:outline-none"
                    style={{ border: "1px solid rgba(255,215,0,0.2)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-1.5">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="Country"
                    className="w-full bg-transparent rounded-xl px-3 py-2.5 text-sm text-white placeholder-guap-dim focus:outline-none"
                    style={{ border: "1px solid rgba(255,215,0,0.2)" }}
                  />
                </div>
              </div>

              {/* Accepted ID Types */}
              <div>
                <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-2">
                  Accepted ID Types <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ID_TYPE_LABELS).map(([key, label]) => {
                    const num = Number(key);
                    const checked = form.acceptedIdTypes.includes(num);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleIdType(num)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-left transition-all"
                        style={{
                          background: checked ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${checked ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: checked ? "#FFD700" : "rgba(255,255,255,0.5)",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            background: checked ? "#FFD700" : "transparent",
                            border: `1px solid ${checked ? "#FFD700" : "rgba(255,255,255,0.2)"}`,
                          }}
                        >
                          {checked && <Check size={10} className="text-black" />}
                        </div>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-1.5">
                  Contact Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  placeholder="contact@yourbusiness.com"
                  className="w-full bg-transparent rounded-xl px-4 py-2.5 text-sm text-white placeholder-guap-dim focus:outline-none"
                  style={{ border: "1px solid rgba(255,215,0,0.2)" }}
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-1.5">
                  Website <span className="text-guap-dim">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="w-full bg-transparent rounded-xl px-4 py-2.5 text-sm text-white placeholder-guap-dim focus:outline-none"
                  style={{ border: "1px solid rgba(255,215,0,0.2)" }}
                />
              </div>

              {/* About */}
              <div>
                <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-1.5">
                  About / Description <span className="text-guap-dim">(optional)</span>
                </label>
                <textarea
                  value={form.about}
                  onChange={(e) => updateField("about", e.target.value)}
                  placeholder="Describe your business and why you want to become a Human Validator..."
                  rows={4}
                  className="w-full bg-transparent rounded-xl px-4 py-2.5 text-sm text-white placeholder-guap-dim focus:outline-none resize-none"
                  style={{ border: "1px solid rgba(255,215,0,0.2)" }}
                />
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Review + Submit ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Review card */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white">Review Your Application</h2>

                <div className="space-y-3">
                  {[
                    { label: "Business Name", value: form.businessName },
                    { label: "Business Type", value: form.businessType },
                    { label: "Location", value: [form.city, form.state, form.country].filter(Boolean).join(", ") },
                    { label: "Contact Email", value: form.contactEmail },
                    { label: "Website", value: form.website || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm gap-3">
                      <span className="text-guap-muted flex-shrink-0">{label}</span>
                      <span className="text-white text-right">{value}</span>
                    </div>
                  ))}

                  <div className="flex justify-between text-sm gap-3">
                    <span className="text-guap-muted flex-shrink-0">Accepted IDs</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {form.acceptedIdTypes.map((t) => (
                        <span key={t} className="credential-badge text-xs">{ID_TYPE_LABELS[t]}</span>
                      ))}
                    </div>
                  </div>

                  {form.about && (
                    <div className="text-sm">
                      <div className="text-guap-muted mb-1">About</div>
                      <div className="text-white text-xs" style={{ lineHeight: "1.6" }}>{form.about}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="glass-gold rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-guap-gold flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white mb-1">Community vote required</div>
                  <p className="text-xs text-guap-muted">
                    Your profile will be pinned to IPFS and an on-chain application submitted.
                    GVOTE holders will vote on your approval. No personal ID data leaves your device.
                  </p>
                </div>
              </div>

              {/* TX status */}
              {(txStatus === "pinning" || txStatus === "submitting") && (
                <div className="glass rounded-xl p-4 flex items-center gap-3 text-sm text-guap-muted">
                  <RefreshCw size={16} className="animate-spin text-guap-gold flex-shrink-0" />
                  {txStatus === "pinning" ? "Pinning profile to IPFS..." : "Submitting application on-chain..."}
                </div>
              )}

              {txStatus === "error" && txError && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-400"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {txError}
                </div>
              )}

              {txStatus === "success" && (
                <div className="glass-gold rounded-2xl p-6 text-center space-y-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                    style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}
                  >
                    <Check size={22} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Application Submitted</h3>
                    <p className="text-sm text-guap-muted">
                      Your application is on-chain and awaiting community review.
                    </p>
                  </div>
                  {txHash && (
                    <a
                      href={`https://explorer.guapcoinx.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-guap-gold hover:underline font-mono block"
                    >
                      {txHash.slice(0, 20)}...
                    </a>
                  )}
                  <button
                    onClick={() => navigate("/validators")}
                    className="btn-gold w-full py-2.5 text-sm"
                  >
                    Back to Validators
                  </button>
                </div>
              )}

              {txStatus !== "success" && (
                <button
                  onClick={() => void handleSubmit()}
                  disabled={txStatus === "pinning" || txStatus === "submitting"}
                  className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
                >
                  {txStatus === "idle" || txStatus === "error" ? (
                    <>Submit Application <ArrowRight size={14} /></>
                  ) : (
                    "Processing..."
                  )}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {txStatus !== "success" && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || txStatus === "pinning" || txStatus === "submitting"}
              className="btn-ghost px-4 py-2 text-sm flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Previous
            </button>
            {step === 0 && (
              <button
                onClick={goNext}
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
