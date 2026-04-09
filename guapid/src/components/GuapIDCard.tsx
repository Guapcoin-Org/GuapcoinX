interface Props {
  size?: number;
  className?: string;
}

/**
 * Digital ID / passport card illustration with embedded Guapcoin logo.
 * Used on the Resolve page as the empty-state and no-result illustration.
 */
export default function GuapIDCard({ size = 96, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size * 0.68}
      viewBox="0 0 140 95"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Card body */}
      <rect x="1" y="1" width="138" height="93" rx="10" fill="#0F0F0F" stroke="#F5A800" strokeWidth="1.5" />

      {/* Card top strip (gold accent bar) */}
      <rect x="1" y="1" width="138" height="14" rx="10" fill="#F5A800" opacity="0.15" />
      <rect x="1" y="10" width="138" height="5" fill="#F5A800" opacity="0.1" />

      {/* Chip (left side) */}
      <rect x="12" y="28" width="22" height="16" rx="3" fill="#1A1A1A" stroke="#F5A800" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="12" y1="33" x2="34" y2="33" stroke="#F5A800" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="12" y1="38" x2="34" y2="38" stroke="#F5A800" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="19" y1="28" x2="19" y2="44" stroke="#F5A800" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="27" y1="28" x2="27" y2="44" stroke="#F5A800" strokeWidth="0.5" strokeOpacity="0.4" />

      {/* Guapcoin logo PNG */}
      <image href="/guap-logo.png" x="73" y="18" width="44" height="44" />

      {/* Text lines (ID data simulation) */}
      <rect x="12" y="52" width="55" height="3" rx="1.5" fill="#F5A800" fillOpacity="0.25" />
      <rect x="12" y="59" width="40" height="3" rx="1.5" fill="#F5A800" fillOpacity="0.15" />
      <rect x="12" y="66" width="48" height="3" rx="1.5" fill="#F5A800" fillOpacity="0.15" />

      {/* MRZ lines at bottom */}
      <rect x="8" y="77" width="124" height="2.5" rx="1" fill="#F5A800" fillOpacity="0.12" />
      <rect x="8" y="83" width="124" height="2.5" rx="1" fill="#F5A800" fillOpacity="0.12" />

      {/* NFC wave symbol (top right corner) */}
      <path d="M122 6 Q126 10 122 14" stroke="#F5A800" strokeWidth="1.2" strokeOpacity="0.5" fill="none" strokeLinecap="round" />
      <path d="M125 4 Q131 10 125 16" stroke="#F5A800" strokeWidth="1.2" strokeOpacity="0.35" fill="none" strokeLinecap="round" />
      <path d="M128 2 Q136 10 128 18" stroke="#F5A800" strokeWidth="1.2" strokeOpacity="0.2" fill="none" strokeLinecap="round" />

      {/* did:guap label */}
      <text x="12" y="22" fontFamily="monospace" fontSize="5" fill="#F5A800" fillOpacity="0.7" letterSpacing="0.5">did:guap</text>
    </svg>
  );
}
