import React from 'react';
import { LayoutGrid } from 'lucide-react';

export function PlaceAtmosphereGallery({
  place,
  photos = [],
  activePhotoIndex = 0,
  onSelectPhoto,
}) {
  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#34322D] bg-[#151513]/90 space-y-6">
      {/* Title & Description */}
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
          About {place?.name}
        </h2>
        <p className="text-xs sm:text-sm text-[#AAA69C] leading-relaxed max-w-4xl">
          {place?.description ||
            'Spacious dining experience in the heart of the city featuring authentic Ethiopian cuisine, craft beverages, and warm cultural hospitality.'}
        </p>
      </div>

      {/* Atmosphere Header */}
      <div className="pt-2 border-t border-[#34322D]/60 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#AAA69C]">
            <LayoutGrid className="w-3.5 h-3.5 text-white/70" />
            <span>Representative Atmosphere &amp; Setting</span>
          </div>
          <span className="text-[11px] text-[#AAA69C]/70">Tap to view in hero</span>
        </div>

        {/* 4 Photo Thumbnails Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.slice(0, 4).map((imgUrl, idx) => {
            const isSelected = activePhotoIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPhoto(idx)}
                aria-label={`View photo ${idx + 1} in hero`}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden border transition-all duration-200 group cursor-pointer ${
                  isSelected
                    ? 'border-white ring-2 ring-white/30 scale-[1.02]'
                    : 'border-[#34322D] hover:border-white/50 opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${place?.name || 'Venue'} atmosphere thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PlaceAtmosphereGallery;

