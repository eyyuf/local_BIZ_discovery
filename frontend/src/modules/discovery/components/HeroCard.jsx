import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';

export function HeroCard({ place }) {
  const heroSlug = place?.slug || 'crater-lake-traditional-kitchen';
  const heroName = place?.name || 'Crater Lake Traditional Habesha Kitchen';
  const heroLocation =
    place?.address?.split(',')?.slice(-2)?.join(',')?.trim() || 'Bishoftu';
  const bgImage = '/assets/bozena-shiro.jpg';

  return (
    <div className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col justify-end overflow-hidden bg-[#0D0D0C] select-none border-none">
      {/* Edge-to-edge Full-Bleed Bozena Shiro in Black Clay Pot Photography */}
      <img
        src={bgImage}
        alt={heroName}
        className="absolute inset-0 w-full h-full object-cover object-[center_35%] pointer-events-none transform scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
      />

      {/* Clean subtle bottom gradient for text contrast - no top black borders */}
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-[#0D0D0C] via-[#0D0D0C]/60 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />

      {/* Hero Headline, Location, and Action at the bottom */}
      <div className="pb-12 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 space-y-4">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight text-border-letters font-display max-w-3xl">
          {heroName}
        </h1>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#AAA69C] font-medium">
          <MapPin className="w-4 h-4 text-white/80 shrink-0" />
          <span>{heroLocation}</span>
        </div>

        <div className="pt-2 sm:pt-3">
          <Link
            to={`/places/${heroSlug}`}
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-white text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-2xl hover:bg-[#F5F2EA] active:scale-95 transition-all cursor-pointer"
          >
            <span>Explore Place</span>
            <ChevronRight className="w-4 h-4 text-black" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HeroCard;
