import React from 'react';

/**
 * Ma'ed Official Business Verification Badge (Blue Tick)
 * Rendered when a business has is_verified === true.
 * Designed with an authentic 12-point scalloped seal with electric sky-blue gradient
 * and high-contrast precision white checkmark, adhering to global industry standards.
 */
export function VerifiedBadge({ size = 'sm', showLabel = false, className = '' }) {
  const dim = size === 'lg' ? 18 : size === 'md' ? 16 : 14;

  const BadgeIcon = () => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_1px_3px_rgba(2,132,199,0.45)]"
      aria-hidden="true"
    >
      <defs>
        {/* Electric Sky Blue Gradient (Universal verified authenticity standard) */}
        <linearGradient id="verified-blue-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>

      {/* 12-Point Scalloped Verification Seal */}
      <path
        d="M12 2l1.6 2.2 2.7-.4 1 2.5 2.7.7.2 2.7 2.3 1.5-.7 2.6 1.6 2.2-1.6 2.2.7 2.6-2.3 1.5-.2 2.7-2.7.7-1 2.5-2.7-.4L12 22l-1.6-2.2-2.7.4-1-2.5-2.7-.7-.2-2.7L1.5 13l.7-2.6L.6 8.2l1.6-2.2-.7-2.6 2.3-1.5.2-2.7 2.7-.7 1-2.5 2.7.4L12 2z"
        fill="url(#verified-blue-gradient)"
      />

      {/* Crisp White Precision Checkmark */}
      <path
        d="M8.5 12.2l2.4 2.4 4.8-5"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (size === 'icon' || (!showLabel && size === 'sm')) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 cursor-default ${className}`}
        title="Verified Spot — Authenticated by Ma'ed"
        aria-label="Verified Spot"
      >
        <BadgeIcon />
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold shadow-sm shrink-0 cursor-default ${className}`}
        title="Verified Spot — Authenticated by Ma'ed"
      >
        <BadgeIcon />
        <span>Verified Venue</span>
      </span>
    );
  }

  // Default 'md' with pill label
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[11px] font-semibold shrink-0 cursor-default ${className}`}
      title="Verified Spot — Authenticated by Ma'ed"
      aria-label="Verified Spot"
    >
      <BadgeIcon />
      <span>Verified</span>
    </span>
  );
}

export default VerifiedBadge;
