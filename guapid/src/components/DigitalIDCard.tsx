import { motion } from "framer-motion";

interface Props {
  did?: string;
  displayName?: string;
  className?: string;
}

/**
 * Premium digital ID card / passport visual.
 * Features the real Guapcoin G logo, holographic shimmer,
 * chip, NFC, MRZ lines, and did:guap identity fields.
 */
export default function DigitalIDCard({
  did = "did:guap:0x7f3a...b291",
  displayName: _displayName = "GUAP IDENTITY",
  className = "",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative select-none ${className}`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        whileHover={{ rotateY: 3, rotateX: -2, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          width: "100%",
          maxWidth: 460,
          aspectRatio: "1.586",
          borderRadius: 18,
          background: "linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 50%, #0a0a0a 100%)",
          border: "1.5px solid rgba(255,215,0,0.45)",
          boxShadow: "0 0 60px rgba(255,215,0,0.12), 0 0 120px rgba(255,215,0,0.05), 0 30px 60px rgba(0,0,0,0.7)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Holographic shimmer overlay */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, transparent 30%, rgba(255,215,0,0.06) 50%, rgba(255,237,78,0.04) 55%, transparent 70%)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />

        {/* Security background pattern */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#FFD700" strokeWidth="0.5" />
            </pattern>
            <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="#FFD700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Top gold accent bar */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent, #FFD700, #FFED4E, #FFD700, transparent)",
        }} />

        {/* Card content */}
        <svg
          viewBox="0 0 460 290"
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Header row ─────────────────────────────────────── */}

          {/* Guapcoin logo PNG */}
          <image href="/guap-logo.png" x="18" y="12" width="72" height="72" />

          {/* Brand text */}
          <text x="112" y="35" fill="#FFD700" fontSize="13" fontWeight="700" fontFamily="Orbitron, Inter, sans-serif" letterSpacing="3">
            GUAPCOIN
          </text>
          <text x="112" y="52" fill="rgba(255,215,0,0.55)" fontSize="8" fontFamily="Inter, sans-serif" letterSpacing="2.5">
            DECENTRALIZED IDENTITY
          </text>

          {/* Country / chain label */}
          <text x="375" y="28" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="Inter, sans-serif" letterSpacing="1.5" textAnchor="middle">
            GUAPCOIN
          </text>
          <text x="375" y="40" fill="rgba(255,215,0,0.35)" fontSize="7" fontFamily="Inter, monospace" letterSpacing="1" textAnchor="middle">
            CHAIN 71111
          </text>

          {/* Separator line */}
          <line x1="22" y1="84" x2="438" y2="84" stroke="rgba(255,215,0,0.2)" strokeWidth="0.8" />

          {/* ── Middle section ──────────────────────────────────── */}

          {/* Avatar / photo box */}
          <rect x="22" y="96" width="70" height="88" rx="6" fill="rgba(255,215,0,0.04)" stroke="rgba(255,215,0,0.25)" strokeWidth="1" />
          {/* Avatar placeholder — G monogram */}
          <circle cx="57" cy="128" r="22" fill="rgba(255,215,0,0.08)" stroke="rgba(255,215,0,0.2)" strokeWidth="1" />
          <text x="57" y="135" fill="rgba(255,215,0,0.5)" fontSize="20" fontWeight="900" fontFamily="Orbitron, sans-serif" textAnchor="middle">G</text>
          <text x="57" y="178" fill="rgba(255,255,255,0.2)" fontSize="5.5" fontFamily="Inter, sans-serif" letterSpacing="1" textAnchor="middle">HOLDER</text>

          {/* NFC chip */}
          <rect x="108" y="96" width="36" height="28" rx="5" fill="rgba(255,215,0,0.06)" stroke="rgba(255,215,0,0.3)" strokeWidth="1" />
          <line x1="108" y1="106" x2="144" y2="106" stroke="rgba(255,215,0,0.2)" strokeWidth="0.6" />
          <line x1="108" y1="114" x2="144" y2="114" strokeWidth="0.6" stroke="rgba(255,215,0,0.2)" />
          <line x1="120" y1="96" x2="120" y2="124" strokeWidth="0.6" stroke="rgba(255,215,0,0.2)" />
          <line x1="132" y1="96" x2="132" y2="124" strokeWidth="0.6" stroke="rgba(255,215,0,0.2)" />
          <text x="126" y="140" fill="rgba(255,215,0,0.4)" fontSize="5.5" fontFamily="Inter, sans-serif" letterSpacing="1" textAnchor="middle">CHIP</text>

          {/* NFC waves */}
          <path d="M158 104 Q163 110 158 116" stroke="rgba(255,215,0,0.5)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M163 101 Q170 110 163 119" stroke="rgba(255,215,0,0.35)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M168 98 Q177 110 168 122" stroke="rgba(255,215,0,0.2)" strokeWidth="1.4" fill="none" strokeLinecap="round" />

          {/* Identity fields */}
          {/* DID label + value */}
          <text x="108" y="158" fill="rgba(255,255,255,0.4)" fontSize="6.5" fontFamily="Inter, sans-serif" letterSpacing="1.5">IDENTIFIER</text>
          <text x="108" y="171" fill="#FFD700" fontSize="8.5" fontFamily="Inter, monospace" letterSpacing="0.5">{did}</text>

          {/* Type label */}
          <text x="108" y="188" fill="rgba(255,255,255,0.4)" fontSize="6.5" fontFamily="Inter, sans-serif" letterSpacing="1.5">TYPE</text>
          <text x="108" y="200" fill="rgba(255,255,255,0.8)" fontSize="8.5" fontFamily="Inter, sans-serif">Self-Sovereign Identity</text>

          {/* Status indicator */}
          <circle cx="320" cy="102" r="4" fill="#00FF00" opacity="0.8" />
          <circle cx="320" cy="102" r="7" fill="none" stroke="#00FF00" strokeWidth="0.8" opacity="0.4" />
          <text x="332" y="106" fill="#00FF00" fontSize="7.5" fontFamily="Inter, sans-serif" letterSpacing="0.5" opacity="0.8">ACTIVE</text>

          {/* Right side — blockchain info */}
          <text x="340" y="130" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="Inter, sans-serif" letterSpacing="1.2" textAnchor="middle">NETWORK</text>
          <text x="340" y="142" fill="rgba(255,215,0,0.7)" fontSize="8" fontFamily="Orbitron, sans-serif" letterSpacing="1" textAnchor="middle">GUAPCOIN</text>

          <text x="340" y="162" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="Inter, sans-serif" letterSpacing="1.2" textAnchor="middle">STANDARD</text>
          <text x="340" y="174" fill="rgba(255,215,0,0.7)" fontSize="8" fontFamily="Inter, monospace" letterSpacing="0.5" textAnchor="middle">W3C DID 1.0</text>

          <text x="340" y="194" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="Inter, sans-serif" letterSpacing="1.2" textAnchor="middle">METHOD</text>
          <text x="340" y="206" fill="rgba(255,215,0,0.7)" fontSize="8" fontFamily="Inter, monospace" letterSpacing="0.5" textAnchor="middle">did:guap</text>

          {/* Separator before MRZ */}
          <line x1="22" y1="220" x2="438" y2="220" stroke="rgba(255,215,0,0.15)" strokeWidth="0.8" />

          {/* ── MRZ zone ────────────────────────────────────────── */}
          <text x="22" y="234" fill="rgba(255,215,0,0.18)" fontSize="5.5" fontFamily="Inter, monospace" letterSpacing="2.8">
            IDGUAP0000000000000000000000000000000000000000
          </text>
          <text x="22" y="246" fill="rgba(255,215,0,0.18)" fontSize="5.5" fontFamily="Inter, monospace" letterSpacing="2.8">
            DID&lt;&lt;GUAP&lt;&lt;BLOCKCHAIN&lt;&lt;IDENTITY&lt;&lt;71111&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </text>
          <text x="22" y="258" fill="rgba(255,215,0,0.18)" fontSize="5.5" fontFamily="Inter, monospace" letterSpacing="2.8">
            SECP256K1&lt;&lt;EVM&lt;&lt;ECDSA&lt;&lt;IPFS&lt;&lt;ANCHORED&lt;&lt;&lt;&lt;&lt;&lt;
          </text>

          {/* Bottom gold line */}
          <line x1="22" y1="270" x2="438" y2="270" stroke="rgba(255,215,0,0.1)" strokeWidth="0.5" />

          {/* Version tag */}
          <text x="438" y="283" fill="rgba(255,215,0,0.2)" fontSize="6" fontFamily="Inter, monospace" textAnchor="end">v1.0 · HAP READY</text>
        </svg>

        {/* Bottom gold accent bar */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)",
        }} />
      </motion.div>

      {/* Glow below card */}
      <div style={{
        position: "absolute",
        bottom: -20,
        left: "10%",
        right: "10%",
        height: 40,
        background: "radial-gradient(ellipse, rgba(255,215,0,0.15) 0%, transparent 70%)",
        filter: "blur(10px)",
        pointerEvents: "none",
      }} />
    </motion.div>
  );
}
