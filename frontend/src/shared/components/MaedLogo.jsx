import React from 'react';

/**
 * Ma'ed (ማዕድ) Brand Logo Component
 *
 * Design Architecture:
 * - Mark: A bespoke geometric monogram of the letter "M" sculpted around a culinary cloche
 *   (serving banquet dome) with an amber dining beacon at the apex, representing the shared Ethiopian table.
 * - Typography: High-contrast geometric display typography with a golden accent apostrophe.
 * - Subtitle: Refined letter-spaced descriptor "ETHIOPIAN DINING GUIDE" and Ge'ez script "ማዕድ".
 */
export function MaedMark({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform group-hover:scale-105 duration-200 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Obsidian-to-charcoal background shield gradient */}
        <linearGradient id="maedBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E1E24" />
          <stop offset="100%" stopColor="#0E0E12" />
        </linearGradient>

        {/* Warm saffron & Ethiopian butter amber gradient for the culinary cloche */}
        <linearGradient id="maedGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Subtle glow for the focal beacon */}
        <filter id="beaconGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded Squircle Container */}
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="13"
        fill="url(#maedBg)"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="1.2"
      />

      {/* Inner Accent Ring with soft amber shimmer */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="11.5"
        fill="none"
        stroke="url(#maedGold)"
        strokeWidth="0.8"
        strokeOpacity="0.35"
      />

      {/* === The "M" Table & Cloche Symbol === */}
      {/* 1. Left Pillar (Seated Host / Table Leg) */}
      <path
        d="M12 34V19.5C12 18.1 13.1 17 14.5 17C15.9 17 17 18.1 17 19.5V34"
        stroke="#F5F2EA"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* 2. Right Pillar (Seated Guest / Table Leg) */}
      <path
        d="M36 34V19.5C36 18.1 34.9 17 33.5 17C32.1 17 31 18.1 31 19.5V34"
        stroke="#F5F2EA"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* 3. Central Banquet Cloche Dome (Forms the center apex of "M") */}
      <path
        d="M17 25C17 20 20.1 16 24 16C27.9 16 31 20 31 25"
        stroke="url(#maedGold)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* 4. Communal Dining Table / Serving Base Platter */}
      <path
        d="M15 30.5H33"
        stroke="url(#maedGold)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* 5. Cloche Finial / Shared Dining Focal Beacon */}
      <circle
        cx="24"
        cy="12"
        r="2.2"
        fill="url(#maedGold)"
        filter="url(#beaconGlow)"
      />
      <circle cx="24" cy="12" r="1.2" fill="#FFFBEB" />
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
    md: 36,
    lg: 44,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const currentMarkSize = markSizes[size] || markSizes.md;

  if (variant === 'mark') {
    return <MaedMark size={currentMarkSize} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Visual Icon Mark */}
      <MaedMark size={currentMarkSize} />

      {/* Brand Typography */}
      {variant !== 'mark' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight text-white font-display ${
                textSizes[size] || textSizes.md
              }`}
            >
              Ma
              <span className="text-[#F59E0B] font-extrabold mx-[1px]">’</span>
              ed
            </span>

            {/* Ge'ez Script Micro-Badge */}
            <span className="text-[10px] font-mono tracking-widest text-[#AAA69C]/80 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
              ማዕድ
            </span>
          </div>

          {showTagline && (
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#AAA69C] mt-0.5">
              Ethiopian Dining Guide
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MaedLogo;
