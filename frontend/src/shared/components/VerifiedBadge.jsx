import React from 'react';

/**
 * Universal Official Verification Badge (Twitter / X Standard Blue Tick)
 * 
 * Uses the exact universal 8-point scalloped starburst rosette with precision
 * white checkmark cutout in iconic Twitter electric verified blue (#1D9BF0).
 */
export function VerifiedBadge({ size = 'sm', showLabel = false, className = '' }) {
  const dim = size === 'lg' ? 20 : size === 'md' ? 17 : 15;

  const BadgeIcon = () => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_1px_2px_rgba(29,155,240,0.4)]"
      aria-hidden="true"
    >
      {/* Universal 8-Point Scalloped Starburst Rosette */}
      <path
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
        fill="#1D9BF0"
      />
      {/* Precision White Checkmark */}
      <path
        d="M10.54 16.2L6.8 12.46l1.41-1.42 2.33 2.33 5.48-5.74 1.43 1.36-6.9 7.21z"
        fill="#FFFFFF"
      />
    </svg>
  );

  if (size === 'icon' || (!showLabel && size === 'sm')) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 cursor-default ${className}`}
        title="Verified Account — Officially Authenticated"
        aria-label="Verified Badge"
      >
        <BadgeIcon />
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D9BF0]/10 border border-[#1D9BF0]/30 text-[#1D9BF0] text-xs font-semibold shadow-sm shrink-0 cursor-default ${className}`}
        title="Verified Account — Officially Authenticated"
      >
        <BadgeIcon />
        <span>Verified Venue</span>
      </span>
    );
  }

  // Default 'md' with pill label
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1D9BF0]/10 border border-[#1D9BF0]/25 text-[#1D9BF0] text-[11px] font-semibold shrink-0 cursor-default ${className}`}
      title="Verified Account — Officially Authenticated"
      aria-label="Verified Badge"
    >
      <BadgeIcon />
      <span>Verified</span>
    </span>
  );
}

export default VerifiedBadge;
