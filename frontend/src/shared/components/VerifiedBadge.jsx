import React from 'react';
import { Check } from 'lucide-react';

/**
 * Local Spot Official Business Verification Badge
 * Rendered exclusively when is_verified === true.
 * Designed with a clean, subtle green tone in harmony with the obsidian aesthetic.
 */
export function VerifiedBadge({ size = 'sm', showLabel = false, className = '' }) {
  if (size === 'icon' || (!showLabel && size === 'sm')) {
    return (
      <span
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 ${className}`}
        title="Verified Business • Officially Authenticated"
        aria-label="Verified Business"
      >
        <Check className="w-2.5 h-2.5 stroke-[3]" />
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-sm shrink-0 ${className}`}
        title="Verified Business • Officially Authenticated"
      >
        <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/30 text-emerald-300">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
        <span>Verified Business</span>
      </span>
    );
  }

  // Default 'md' with pill label
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium shrink-0 ${className}`}
      title="Verified Business • Officially Authenticated"
      aria-label="Verified Business"
    >
      <Check className="w-3 h-3 stroke-[2.5]" />
      <span>Verified</span>
    </span>
  );
}

export default VerifiedBadge;
