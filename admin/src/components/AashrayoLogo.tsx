import React from "react";

interface LogoProps {
  size?: number;
  variant?: "full" | "icon" | "stacked";
  theme?: "dark" | "light";
  className?: string;
  subtitle?: string;
}

export const AashrayoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Aashrayo Logo Icon"
    >
      <defs>
        {/* Primary architectural apex gradient */}
        <linearGradient id="aashrayo-grad-primary" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4318FF" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>

        {/* Dynamic shelter roof facet gradient */}
        <linearGradient id="aashrayo-grad-facet" x1="50" y1="12" x2="88" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>

        {/* Luminous beacon core */}
        <linearGradient id="aashrayo-grad-beacon" x1="30" y1="40" x2="70" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Soft drop shadow */}
        <filter id="aashrayo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer Protective Hexagonal / Arch Shield */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="22"
        fill="url(#aashrayo-grad-primary)"
        filter="url(#aashrayo-glow)"
      />

      {/* Decorative architectural grid lines */}
      <circle cx="50" cy="50" r="36" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
      
      {/* Modern Stylized A Apex (Roofline + Growth Haven) */}
      <path
        d="M50 20L76 74H60L50 51L40 74H24L50 20Z"
        fill="#ffffff"
        fillRule="evenodd"
      />

      {/* Inner Floating Triangular Haven / Aashray Sanctuary */}
      <path
        d="M50 36L61 58H39L50 36Z"
        fill="url(#aashrayo-grad-facet)"
      />

      {/* Modern Center Pillar of Trust */}
      <path
        d="M50 49L54.5 58H45.5L50 49Z"
        fill="url(#aashrayo-grad-beacon)"
      />

      {/* Diamond Apex Keystone Beacon */}
      <polygon
        points="50,15 54,20 50,25 46,20"
        fill="#f8fafc"
      />
    </svg>
  );
};

export const AashrayoLogo: React.FC<LogoProps> = ({
  size = 44,
  variant = "full",
  theme = "light",
  className = "",
  subtitle = "OPERATIONS & COMPLIANCE",
}) => {
  const isDark = theme === "dark";
  const titleColor = isDark ? "#ffffff" : "#0f172a";
  const subColor = isDark ? "#a78bfa" : "#7c3aed";

  if (variant === "icon") {
    return <AashrayoIcon size={size} className={className} />;
  }

  if (variant === "stacked") {
    return (
      <div
        className={`aashrayo-logo stacked ${className}`}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <AashrayoIcon size={size} />
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontSize: size > 48 ? 26 : 22,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: titleColor,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            AASHRAYO
          </h2>
          {subtitle && (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: subColor,
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full Horizontal
  return (
    <div
      className={`aashrayo-logo horizontal ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <AashrayoIcon size={size} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h2
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.04em",
            color: titleColor,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          AASHRAYO
        </h2>
        {subtitle && (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: subColor,
              marginTop: 2,
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
