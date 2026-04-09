import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, Shield, Globe, Zap, ArrowRight, Link2 } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { hasDIDDocument } from "../lib/contract";
import Navbar from "../components/Navbar";
import GoldParticles from "../components/GoldParticles";
import DigitalIDCard from "../components/DigitalIDCard";

export default function Home() {
  const { wallet, connect } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet.status !== "connected") return;
    hasDIDDocument(wallet.address).then((has) => {
      if (has) navigate("/dashboard");
      else navigate("/create");
    });
  }, [wallet.status, navigate]);

  const features = [
    {
      icon: <Shield size={20} style={{ color: "#FFD700" }} />,
      title: "Self-Sovereign Identity",
      body: "Your wallet address is your DID. No intermediary, no approval, no centralized store.",
    },
    {
      icon: <Link2 size={20} style={{ color: "#FFD700" }} />,
      title: "On-Chain Anchored",
      body: "Every identity document is permanently anchored on Guapcoin — tamper-evident and verifiable.",
    },
    {
      icon: <Globe size={20} style={{ color: "#FFD700" }} />,
      title: "IPFS-Stored Documents",
      body: "DID Documents live on IPFS. Content-addressed, permanent, and censorship-resistant.",
    },
    {
      icon: <Zap size={20} style={{ color: "#FFD700" }} />,
      title: "HAP Creator Integration",
      body: "Link your DID to your HAP authorship profile — proving creative identity across platforms.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)" }}>
      <GoldParticles />
      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ── Hero — two-column layout ──────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-5 pt-20 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — text + CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex-1 text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
                style={{
                  background: "rgba(255,215,0,0.06)",
                  border: "1px solid rgba(255,215,0,0.25)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#FFD700" }} />
                <span className="text-xs font-semibold font-mono" style={{ color: "#FFD700" }}>
                  did:guap — Guapcoin Blockchain
                </span>
              </motion.div>

              <h1
                className="font-black tracking-tight text-white mb-5 leading-tight"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
              >
                Your Identity,{" "}
                <span className="gold-text">Your Keys</span>
              </h1>

              <p className="text-base mb-8 leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
                Create a decentralized identifier on the Guapcoin blockchain. Your wallet is your identity — no accounts, no approval, no middleman.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {wallet.status === "connected" ? (
                  <motion.button
                    onClick={() => navigate("/create")}
                    className="btn-gold px-8 py-3 text-sm flex items-center justify-center gap-2 rounded-xl"
                    whileTap={{ scale: 0.97 }}
                  >
                    Create Your DID <ArrowRight size={16} />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={connect}
                    className="btn-gold px-8 py-3 text-sm flex items-center justify-center gap-2 rounded-xl"
                    whileTap={{ scale: 0.97 }}
                    disabled={wallet.status === "connecting"}
                  >
                    <Wallet size={16} />
                    {wallet.status === "connecting" ? "Connecting..." : "Connect Wallet to Start"}
                  </motion.button>
                )}
                <motion.button
                  onClick={() => navigate("/resolve")}
                  className="btn-outline px-8 py-3 text-sm flex items-center justify-center gap-2 rounded-xl"
                  whileTap={{ scale: 0.97 }}
                >
                  Resolve a DID <ArrowRight size={16} />
                </motion.button>
              </div>

              {/* DID format pill */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 did-badge inline-block text-left"
              >
                did:guap:0x7f3a9b2c...5d6e7f8
              </motion.div>
            </motion.div>

            {/* Right — Digital ID Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex-1 flex justify-center lg:justify-end w-full"
            >
              <DigitalIDCard
                did="did:guap:0x7f3a...b291"
                className="w-full max-w-[460px]"
              />
            </motion.div>

          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="max-w-[1200px] mx-auto px-5 flex items-center gap-4 mb-12">
          <div className="flex-1 h-px" style={{ background: "rgba(255,215,0,0.1)" }} />
          <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
            How it works
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,215,0,0.1)" }} />
        </div>

        {/* ── Feature cards ─────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-5 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="glass rounded-2xl p-5 transition-all duration-300"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── DID format callout ────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-5 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-gold rounded-2xl p-8 text-center"
          >
            <div
              className="text-xs uppercase tracking-widest font-semibold mb-4"
              style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "2px" }}
            >
              DID Format
            </div>
            <div className="font-mono text-2xl text-white mb-3">
              <span style={{ color: "rgba(255,255,255,0.3)" }}>did:</span>
              <span style={{ color: "#FFD700" }}>guap</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>:</span>
              <span className="text-white">0x&lt;wallet-address&gt;</span>
            </div>
            <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your wallet address is your DID. Registration anchors your DID Document — permanent and deterministic.
            </p>
          </motion.div>
        </section>

      </main>
    </div>
  );
}
