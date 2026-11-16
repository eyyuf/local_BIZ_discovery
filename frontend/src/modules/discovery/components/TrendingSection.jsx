import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PlaceCard } from '@/modules/places/components/PlaceCard';

export function TrendingSection({ places = [] }) {
  const [timeRange, setTimeRange] = useState('Day');

  // Top 5 trending from explore feed
  const rankedPlaces = places.slice(0, 5);

  if (rankedPlaces.length === 0) {
    return null;
  }

  return (
    <section className="w-full space-y-5">
      {/* Header with time toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/search?sort=trending"
            className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-white hover:text-white/80 transition font-display group"
          >
            <span>Trending</span>
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Time range pills */}
          <div className="flex items-center gap-1 bg-[#151513] p-1 rounded-full border border-white/10 text-xs">
            {['Day', 'Week', 'Month'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${
                  timeRange === t
                    ? 'border border-white bg-white/15 text-white shadow-sm'
                    : 'text-[#AAA69C] hover:text-white border border-transparent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Link
          to="/search?sort=trending"
          className="text-xs font-mono uppercase tracking-wider text-[#AAA69C] hover:text-white transition"
        >
          See all ranked spots
        </Link>
      </div>

      {/* 5 Ranked Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {rankedPlaces.map((place, index) => (
          <PlaceCard
            key={place.id || place.slug}
            place={place}
            rank={index + 1}
          />
        ))}
      </div>
    </section>
  );
}

export default TrendingSection;
