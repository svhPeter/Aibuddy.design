/** Inline SVG placeholders (no external assets) until /public/work/*.png exist. */

type Variant = "shoppos" | "cosmicweb" | "doctor";

export function PortfolioPlaceholderArt({ variant }: { variant: Variant }) {
  if (variant === "shoppos") {
    return (
      <svg
        viewBox="0 0 300 400"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="sp-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#2a2a2a" />
          </linearGradient>
        </defs>
        <rect width="300" height="400" fill="url(#sp-bg)" />
        {/* Isometric POS / register stack */}
        <g transform="translate(75 120) rotate(-12 75 90)">
          <path
            d="M0 60 L130 30 L130 100 L0 130 Z"
            fill="#F9FF00"
            stroke="#000"
            strokeWidth="3"
          />
          <path
            d="M130 30 L200 55 L200 125 L130 100 Z"
            fill="#d4d400"
            stroke="#000"
            strokeWidth="3"
          />
          <path
            d="M0 60 L70 85 L70 155 L0 130 Z"
            fill="#e8ec00"
            stroke="#000"
            strokeWidth="3"
          />
          <rect x="25" y="55" width="75" height="28" fill="#1a1a1a" rx="2" />
          <rect x="30" y="95" width="65" height="8" fill="#FF0004" opacity="0.9" />
        </g>
        <text
          x="150"
          y="360"
          textAnchor="middle"
          fill="#F9FF00"
          fontFamily="system-ui,sans-serif"
          fontSize="14"
          fontWeight="700"
          letterSpacing="0.2em"
        >
          SAAS · POS
        </text>
      </svg>
    );
  }

  if (variant === "cosmicweb") {
    return (
      <svg
        viewBox="0 0 300 400"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <radialGradient id="cw-sun" cx="40%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#fff7a0" />
            <stop offset="40%" stopColor="#F9FF00" />
            <stop offset="100%" stopColor="#e6c200" />
          </radialGradient>
          <linearGradient id="cw-space" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d0221" />
            <stop offset="100%" stopColor="#1a0a2e" />
          </linearGradient>
        </defs>
        <rect width="300" height="400" fill="url(#cw-space)" />
        <circle cx="120" cy="170" r="38" fill="url(#cw-sun)" stroke="#000" strokeWidth="2" />
        <ellipse
          cx="120"
          cy="170"
          rx="95"
          ry="28"
          fill="none"
          stroke="#F9FF00"
          strokeWidth="1.5"
          opacity="0.5"
          transform="rotate(-20 120 170)"
        />
        <circle cx="210" cy="120" r="8" fill="#a8c5dd" stroke="#000" strokeWidth="1.5" />
        <circle cx="60" cy="240" r="12" fill="#c4a574" stroke="#000" strokeWidth="1.5" />
        <circle cx="200" cy="260" r="6" fill="#8899aa" stroke="#000" strokeWidth="1" />
        <path
          d="M20 320 Q150 280 280 340"
          fill="none"
          stroke="#FF0004"
          strokeWidth="2"
          opacity="0.6"
        />
        <text
          x="150"
          y="380"
          textAnchor="middle"
          fill="#F9FF00"
          fontFamily="system-ui,sans-serif"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.25em"
        >
          3D · SPACE
        </text>
      </svg>
    );
  }

  // doctor
  return (
    <svg
      viewBox="0 0 300 400"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="300" height="400" fill="#e8eef2" />
      {/* Phone frame isometric */}
      <g transform="translate(85 95)">
        <path
          d="M0 40 L90 10 L90 210 L0 240 Z"
          fill="#fff"
          stroke="#000"
          strokeWidth="3"
        />
        <path
          d="M90 10 L130 35 L130 235 L90 210 Z"
          fill="#f0f0f0"
          stroke="#000"
          strokeWidth="3"
        />
        <path
          d="M0 40 L40 65 L40 265 L0 240 Z"
          fill="#fafafa"
          stroke="#000"
          strokeWidth="3"
        />
        <rect x="15" y="70" width="55" height="100" fill="#1a1a1a" rx="4" />
        <rect x="22" y="85" width="41" height="14" fill="#F9FF00" rx="2" />
        <circle cx="42" cy="195" r="8" fill="#FF0004" opacity="0.85" />
      </g>
      <text
        x="150"
        y="360"
        textAnchor="middle"
        fill="#1a1a1a"
        fontFamily="system-ui,sans-serif"
        fontSize="12"
        fontWeight="700"
        letterSpacing="0.2em"
      >
        FLUTTER · MVP
      </text>
    </svg>
  );
}

export function placeholderVariantForProjectId(id: number): Variant {
  if (id === 1) return "shoppos";
  if (id === 2) return "cosmicweb";
  return "doctor";
}
