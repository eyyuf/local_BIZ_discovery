import React from 'react';
import { Phone, Globe } from 'lucide-react';

export function PlaceDirectContact({ place }) {
  if (!place?.phone && !place?.website) {
    return null;
  }

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#34322D] bg-[#151513]/90 space-y-4">
      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
        Additional Information
      </h2>

      <div className="pt-2">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#AAA69C]/80 mb-2">
          Direct Contact
        </h3>

        <div className="flex flex-wrap items-center gap-6">
          {place?.phone && (
            <a
              href={`tel:${place.phone}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white hover:text-white/80 transition"
            >
              <Phone className="w-4 h-4 text-white/70" />
              <span>{place.phone}</span>
            </a>
          )}

          {place?.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white hover:text-white/80 transition"
            >
              <Globe className="w-4 h-4 text-white/70" />
              <span>Visit Website</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaceDirectContact;

