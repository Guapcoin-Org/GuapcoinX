import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useWallet } from "../hooks/useWallet";
import { formatAddress } from "../lib/chain";
import { Copy, LogOut, Wallet } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { wallet, connect, disconnect } = useWallet();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (wallet.status === "connected") {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(255,215,0,0.15)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Guapcoin logo */}
          <img src="/guap-logo.png" alt="Guapcoin" className="w-9 h-9 flex-shrink-0" />
          <div>
            <div
              className="text-sm font-bold tracking-brand gold-text"
              style={{ fontFamily: "Orbitron, Inter, sans-serif", letterSpacing: "2px" }}
            >
              GUAPID
            </div>
            <div className="text-xs font-mono" style={{ color: "rgba(255,215,0,0.6)" }}>did:guap</div>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-7">
          {[
            { path: "/", label: "Home" },
            { path: "/resolve", label: "Resolve" },
            { path: "/validators", label: "Validators" },
            { path: "/docs", label: "Docs" },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link tracking-wide-custom ${isActive(link.path) ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {wallet.status === "connected" && (
            <Link
              to="/dashboard"
              className={`nav-link tracking-wide-custom ${isActive("/dashboard") ? "active" : ""}`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-2">
          {wallet.status === "connected" ? (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={copyAddress}
                className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-mono cursor-pointer transition-all"
                style={{
                  background: "rgba(255,215,0,0.08)",
                  border: "1px solid rgba(255,215,0,0.25)",
                  color: "#FFD700",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {formatAddress(wallet.address)}
                <Copy size={11} className={copied ? "text-green-400" : ""} />
              </motion.button>
              <button
                onClick={disconnect}
                className="btn-ghost p-2 rounded-xl"
                title="Disconnect"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : wallet.status === "wrong_network" ? (
            <button
              onClick={() => {
                import("../lib/chain").then(({ ensureGuapcoinNetwork }) =>
                  ensureGuapcoinNetwork().then(() => window.location.reload())
                );
              }}
              className="btn-outline text-xs px-4 py-2"
            >
              Switch to Guapcoin
            </button>
          ) : (
            <motion.button
              onClick={connect}
              className="btn-gold text-xs px-4 py-2 flex items-center gap-2 rounded-xl"
              whileTap={{ scale: 0.98 }}
              disabled={wallet.status === "connecting"}
            >
              <Wallet size={13} />
              {wallet.status === "connecting" ? "Connecting..." : "Connect Wallet"}
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
