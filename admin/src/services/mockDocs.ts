/**
 * Realistic Document Previews (SVG Data URIs) for KYC Verification
 * Includes PAN Card, Aadhaar Card (Front & Back), and Cancelled Cheque.
 */

export const generatePanCardSvg = (pan: string, name: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="100%" height="100%">
    <defs>
      <linearGradient id="panGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7" />
        <stop offset="50%" stop-color="#fde68a" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2" />
      </linearGradient>
    </defs>
    <rect width="480" height="300" rx="16" fill="url(#panGrad)" stroke="#d97706" stroke-width="2"/>
    
    <!-- Top Emblem & Header -->
    <rect x="0" y="0" width="480" height="56" rx="16" fill="#1e3a8a"/>
    <text x="240" y="24" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">INCOME TAX DEPARTMENT</text>
    <text x="240" y="42" font-family="Arial, sans-serif" font-size="11" fill="#93c5fd" text-anchor="middle">GOVT. OF INDIA</text>
    
    <!-- Chip -->
    <rect x="36" y="74" width="46" height="36" rx="6" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
    <line x1="36" y1="92" x2="82" y2="92" stroke="#b45309" stroke-width="1"/>
    
    <!-- Photo Box -->
    <rect x="36" y="125" width="85" height="105" rx="6" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
    <circle cx="78" cy="160" r="22" fill="#9ca3af"/>
    <path d="M46 220 Q78 185 110 220 Z" fill="#9ca3af"/>
    
    <!-- Fields -->
    <text x="140" y="90" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">Permanent Account Number Card</text>
    <text x="140" y="118" font-family="Courier, monospace" font-size="20" font-weight="bold" fill="#111827" letter-spacing="2">${pan}</text>
    
    <text x="140" y="148" font-family="Arial, sans-serif" font-size="9" fill="#6b7280">Name</text>
    <text x="140" y="166" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1e293b">${name.toUpperCase()}</text>
    
    <text x="140" y="190" font-family="Arial, sans-serif" font-size="9" fill="#6b7280">Father's Name</text>
    <text x="140" y="206" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#334155">R. K. KRISHNA</text>
    
    <text x="140" y="230" font-family="Arial, sans-serif" font-size="9" fill="#6b7280">Date of Birth</text>
    <text x="140" y="246" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#334155">14/08/1992</text>
    
    <!-- Hologram & Sign -->
    <rect x="370" y="130" width="75" height="60" rx="6" fill="#e0e7ff" stroke="#818cf8" stroke-dasharray="2,2"/>
    <text x="407" y="165" font-family="Arial, sans-serif" font-size="9" fill="#4f46e5" text-anchor="middle">HOLOGRAM</text>
    
    <rect x="360" y="210" width="95" height="35" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
    <path d="M370 232 Q390 220 410 230 T445 225" stroke="#1e3a8a" stroke-width="2" fill="none"/>
    <text x="407" y="258" font-family="Arial, sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">Signature</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const generateAadhaarFrontSvg = (aadhaarNum: string, name: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="100%" height="100%">
    <defs>
      <linearGradient id="aadhGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff7ed" />
        <stop offset="50%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#ecfdf5" />
      </linearGradient>
    </defs>
    <rect width="480" height="300" rx="16" fill="url(#aadhGrad)" stroke="#16a34a" stroke-width="2"/>
    
    <!-- Top Tricolor Ribbon -->
    <rect x="0" y="0" width="480" height="12" rx="16" fill="#ea580c"/>
    <rect x="0" y="12" width="480" height="12" fill="#ffffff"/>
    <rect x="0" y="24" width="480" height="12" fill="#16a34a"/>
    
    <text x="240" y="58" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1f2937" text-anchor="middle">Government of India</text>
    <text x="240" y="74" font-family="Arial, sans-serif" font-size="11" fill="#ea580c" text-anchor="middle">भारत सरकार</text>
    
    <!-- Photo Box -->
    <rect x="32" y="95" width="95" height="120" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
    <circle cx="79" cy="138" r="26" fill="#94a3b8"/>
    <path d="M42 205 Q79 165 116 205 Z" fill="#94a3b8"/>
    
    <!-- Details -->
    <text x="145" y="115" font-family="Arial, sans-serif" font-size="11" fill="#64748b">Name / नाम</text>
    <text x="145" y="136" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${name}</text>
    
    <text x="145" y="165" font-family="Arial, sans-serif" font-size="11" fill="#64748b">DOB: 14/08/1992</text>
    <text x="145" y="185" font-family="Arial, sans-serif" font-size="11" fill="#64748b">Gender / लिंग: MALE / पुरुष</text>
    
    <!-- QR Code Mock -->
    <rect x="375" y="100" width="75" height="75" rx="6" fill="#0f172a"/>
    <rect x="382" y="107" width="22" height="22" fill="#ffffff"/>
    <rect x="421" y="107" width="22" height="22" fill="#ffffff"/>
    <rect x="382" y="146" width="22" height="22" fill="#ffffff"/>
    <rect x="388" y="113" width="10" height="10" fill="#0f172a"/>
    <rect x="427" y="113" width="10" height="10" fill="#0f172a"/>
    <rect x="388" y="152" width="10" height="10" fill="#0f172a"/>
    
    <!-- Aadhaar Number -->
    <rect x="32" y="240" width="416" height="42" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="240" y="268" font-family="Courier, monospace" font-size="22" font-weight="bold" fill="#b91c1c" text-anchor="middle" letter-spacing="4">${aadhaarNum}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const generateAadhaarBackSvg = (address: string): string => {
  const displayAddress = address || "Flat 1204, Tower 2, Express Astra, Sector 1, Greater Noida West, UP - 201306";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="100%" height="100%">
    <rect width="480" height="300" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    
    <!-- Header -->
    <rect x="0" y="0" width="480" height="36" rx="16" fill="#334155"/>
    <text x="240" y="23" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Unique Identification Authority of India (UIDAI)</text>
    
    <!-- Address Text -->
    <text x="32" y="65" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569">Address / पता:</text>
    <text x="32" y="90" font-family="Arial, sans-serif" font-size="12" fill="#1e293b" font-weight="500">S/O: R. K. Krishna</text>
    <text x="32" y="112" font-family="Arial, sans-serif" font-size="12" fill="#1e293b" font-weight="500">${displayAddress}</text>
    
    <!-- Barcode -->
    <rect x="32" y="180" width="280" height="40" fill="#ffffff" stroke="#e2e8f0"/>
    <line x1="45" y1="185" x2="45" y2="215" stroke="#000" stroke-width="3"/>
    <line x1="55" y1="185" x2="55" y2="215" stroke="#000" stroke-width="1.5"/>
    <line x1="62" y1="185" x2="62" y2="215" stroke="#000" stroke-width="4"/>
    <line x1="72" y1="185" x2="72" y2="215" stroke="#000" stroke-width="2"/>
    <line x1="82" y1="185" x2="82" y2="215" stroke="#000" stroke-width="3"/>
    <line x1="95" y1="185" x2="95" y2="215" stroke="#000" stroke-width="1.5"/>
    <line x1="108" y1="185" x2="108" y2="215" stroke="#000" stroke-width="5"/>
    <line x1="125" y1="185" x2="125" y2="215" stroke="#000" stroke-width="2"/>
    <line x1="140" y1="185" x2="140" y2="215" stroke="#000" stroke-width="3"/>
    <line x1="155" y1="185" x2="155" y2="215" stroke="#000" stroke-width="4"/>
    <line x1="172" y1="185" x2="172" y2="215" stroke="#000" stroke-width="1.5"/>
    <line x1="190" y1="185" x2="190" y2="215" stroke="#000" stroke-width="3"/>
    <line x1="210" y1="185" x2="210" y2="215" stroke="#000" stroke-width="5"/>
    <line x1="230" y1="185" x2="230" y2="215" stroke="#000" stroke-width="2"/>
    <line x1="250" y1="185" x2="250" y2="215" stroke="#000" stroke-width="3"/>
    <line x1="270" y1="185" x2="270" y2="215" stroke="#000" stroke-width="4"/>
    <line x1="290" y1="185" x2="290" y2="215" stroke="#000" stroke-width="2"/>

    <!-- Helpline footer -->
    <rect x="0" y="250" width="480" height="50" rx="16" fill="#f1f5f9"/>
    <text x="240" y="272" font-family="Arial, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Helpdesk: 1947 | help@uidai.gov.in | www.uidai.gov.in</text>
    <text x="240" y="288" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#047857" text-anchor="middle">मेरा आधार, मेरी पहचान</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const generateCancelledChequeSvg = (
  accNo: string,
  ifsc: string,
  name: string
): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 250" width="100%" height="100%">
    <rect width="540" height="250" rx="8" fill="#f0fdfa" stroke="#0d9488" stroke-width="2"/>
    
    <!-- Watermark / Microprint lines -->
    <line x1="20" y1="40" x2="520" y2="40" stroke="#ccfbf1" stroke-width="1"/>
    <line x1="20" y1="80" x2="520" y2="80" stroke="#ccfbf1" stroke-width="1"/>
    <line x1="20" y1="120" x2="520" y2="120" stroke="#ccfbf1" stroke-width="1"/>
    <line x1="20" y1="160" x2="520" y2="160" stroke="#ccfbf1" stroke-width="1"/>
    <line x1="20" y1="200" x2="520" y2="200" stroke="#ccfbf1" stroke-width="1"/>
    
    <!-- Bank Logo & Name -->
    <rect x="25" y="16" width="30" height="22" rx="4" fill="#0284c7"/>
    <text x="64" y="28" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0369a1">HDFC BANK LTD</text>
    <text x="64" y="42" font-family="Arial, sans-serif" font-size="9" fill="#64748b">Sector 62, Noida Branch · IFSC: ${ifsc}</text>
    
    <!-- Date Box -->
    <rect x="420" y="15" width="100" height="22" rx="2" fill="#ffffff" stroke="#94a3b8"/>
    <text x="470" y="30" font-family="Courier, monospace" font-size="11" fill="#64748b" text-anchor="middle">DD MM YYYY</text>
    
    <!-- Payee Line -->
    <text x="25" y="80" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569">PAY</text>
    <line x1="60" y1="84" x2="440" y2="84" stroke="#94a3b8" stroke-width="1"/>
    
    <!-- CANCELLED STAMP (Bold Red Diagonal) -->
    <g transform="rotate(-18 270 125)">
      <line x1="90" y1="95" x2="450" y2="95" stroke="#ef4444" stroke-width="5"/>
      <text x="270" y="132" font-family="Arial Black, Impact, sans-serif" font-size="44" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="6" opacity="0.85">CANCELLED</text>
      <line x1="90" y1="155" x2="450" y2="155" stroke="#ef4444" stroke-width="5"/>
    </g>
    
    <!-- Account Number Box -->
    <rect x="70" y="135" width="180" height="28" fill="#ffffff" stroke="#0284c7" stroke-width="1.5"/>
    <text x="78" y="147" font-family="Arial, sans-serif" font-size="8" fill="#0284c7">A/C NO.</text>
    <text x="160" y="155" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">${accNo}</text>
    
    <!-- Signatory Name -->
    <text x="460" y="195" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">${name}</text>
    <text x="460" y="210" font-family="Arial, sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">Authorized Signatory</text>
    
    <!-- MICR Band -->
    <rect x="0" y="222" width="540" height="28" fill="#e2e8f0"/>
    <text x="270" y="240" font-family="Courier, monospace" font-size="11" fill="#1e293b" text-anchor="middle" letter-spacing="3">⑈123456⑈ 110240045⑆ 001234⑈ 10</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
