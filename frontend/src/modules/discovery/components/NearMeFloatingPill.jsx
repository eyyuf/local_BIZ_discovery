import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocateFixed, X } from 'lucide-react';

export function NearMeFloatingPill() {
  const navigate = useNavigate();
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  return (
    <div className="relative inline-flex flex-col items-end">
      {/* Pill matching Screenshot */}
      <button
        type="button"
        onClick={() => navigate('/nearby')}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/25 bg-black/60 text-xs font-semibold text-white shadow-lg backdrop-blur-md hover:border-white hover:bg-black/80 transition active:scale-95 cursor-pointer"
      >
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <LocateFixed className="w-3.5 h-3.5 text-white/90" />
        <span>Near Me</span>
      </button>

      {/* Tooltip matching Screenshot */}
      {!tooltipDismissed && (
        <div className="absolute top-10 right-0 z-30 mt-2 w-64 p-3 rounded-xl bg-black/85 border border-white/20 shadow-2xl backdrop-blur-xl text-left animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] leading-relaxed text-[#AAA69C]">
              Find cafes, stays &amp; spots near your current GPS location.
            </p>
            <button
              type="button"
              onClick={() => setTooltipDismissed(true)}
              aria-label="Dismiss location tooltip"
              className="p-0.5 rounded-full text-[#AAA69C] hover:text-white transition"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NearMeFloatingPill;
