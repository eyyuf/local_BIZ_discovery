import React from 'react';

/**
 * Ma'ed (ማዕድ) Brand Logo Component
 *
 * Production-Level Visual Architecture:
 * - Mark: A continuous, sculptural geometric letter "M" forming a culinary banquet cloche
 *   resting on an Ethiopian communal platter base line, crowned with an amber dining star.
 * - Typography: High-contrast display typography with a bespoke 45° amber diamond accent mark.
 * - Ge'ez Seal: Integrated cultural typography (ማዕድ) seamlessly balanced without tacky box borders.
 */
export function MaedMark({ size = 34, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform group-hover:scale-105 duration-200 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle ambient warmth behind the mark */}
        <radialGradient id="ambientWarmth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>

        {/* Ethiopian Saffron Gold Gradient */}
        <linearGradient id="maedGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Soft bloom for the beacon star */}
        <filter id="starBloom" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient warm radial glow */}
      <circle cx="18" cy="18" r="16" fill="url(#ambientWarmth)" />

      {/* Communal Platter Base Line (Serving table) */}
      <path
        d="M 5 27.5 H 31"
        stroke="url(#maedGold)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Primary Sculptural "M" Banquet Arch */}
      <path
        d="M 8 26.5 V 18 C 8 13 12 12 16 16.5 L 18 18.8 L 20 16.5 C 24 12 28 13 28 18 V 26.5"
        stroke="#F5F2EA"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Cloche Dome Arc (Ties the "M" into an authentic food cloche) */}
      <path
        d="M 12.5 21 C 14 17 16 15.2 18 15.2 C 20 15.2 22 17 23.5 21"
        stroke="url(#maedGold)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Dining Beacon Star / Cloche Pearl */}
      <circle
        cx="18"
        cy="9.5"
        r="2.2"
        fill="url(#maedGold)"
        filter="url(#starBloom)"
      />
      <circle cx="18" cy="9.5" r="1" fill="#FFFFFF" />
    </svg>
  );
}

export function MaedLogo({
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'full', // 'full' | 'mark' | 'wordmark'
  showTagline = false,
  className = '',
}) {
  const markSizes = {
    sm: 28,
    md: 34,
    lg: 42,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
  };

  const currentMarkSize = markSizes[size] || markSizes.md;

  if (variant === 'mark') {
    return <MaedMark size={currentMarkSize} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Freestanding Vector Mark */}
      <MaedMark size={currentMarkSize} />

      {/* Brand Typography Lockup */}
      {variant !== 'mark' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            {/* Custom Wordmark */}
            <span
              className={`font-black tracking-tight text-white font-display flex items-baseline ${
                textSizes[size] || textSizes.md
              }`}
            >
              <span>Ma</span>
              {/* Bespoke 45° Amber Diamond Accent */}
              <span
                className="inline-block w-1.5 h-1.5 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rotate-45 mx-0.5 mb-1.5 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                aria-hidden="true"
              />
              <span>ed</span>
            </span>

            {/* Seamless Ge'ez Script Signature (No tacky grey box) */}
            <span
              className="text-xs font-mono font-bold tracking-widest text-amber-400/90 ml-1 opacity-90 select-none hover:opacity-100 transition-opacity"
              title="ማዕድ — Banquet / Dining Table"
            >
              ማዕድ
            </span>
          </div>

          {showTagline && (
            <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#AAA69C] mt-0.5">
              Ethiopian Dining Guide
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MaedLogo;
