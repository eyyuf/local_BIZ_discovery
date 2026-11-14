import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { PlaceCard } from '@/modules/places/components/PlaceCard';

export function TopRatedSection({ places = [] }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const scrollContainerRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'cafes', label: 'Cafes' },
    { id: 'dining', label: 'Dining' },
    { id: 'stays', label: 'Stays' },
  ];

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredPlaces = places.filter((place) => {
    if (activeCategory === 'all') return true;
    const slug = (place?.slug || '').toLowerCase();
    const name = (place?.name || '').toLowerCase();
    if (activeCategory === 'cafes') {
      return slug.includes('coffee') || slug.includes('roaster') || slug.includes('cafe') || name.includes('cafe') || name.includes('coffee');
    }
    if (activeCategory === 'dining') {
      return slug.includes('kitchen') || slug.includes('bistro') || slug.includes('fish') || slug.includes('grill') || slug.includes('dining') || slug.includes('crust') || slug.includes('bakery') || slug.includes('pastry');
    }
    if (activeCategory === 'stays') {
      return slug.includes('resort') || slug.includes('inn') || slug.includes('hotel') || slug.includes('suites') || slug.includes('spa');
    }
    return true;
  });

  if (places.length === 0) {
    return null;
  }

  return (
    <section className="w-full space-y-5">
      {/* Header with category pills & arrows */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/search?sort=rating"
            className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-white hover:text-white/80 transition font-display group"
          >
            <span>Top Rated</span>
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === c.id
                    ? 'border border-white bg-white/15 text-white shadow-sm'
                    : 'border border-white/15 bg-black/30 text-[#AAA69C] hover:text-white hover:border-white/40'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Previous top rated spots"
            className="w-8 h-8 rounded-full border border-white/20 bg-[#16161A] text-[#AAA69C] hover:text-white hover:border-white flex items-center justify-center transition active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Next top rated spots"
            className="w-8 h-8 rounded-full border border-white/20 bg-[#16161A] text-[#AAA69C] hover:text-white hover:border-white flex items-center justify-center transition active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Place Cards Horizontal Carousel */}
      {filteredPlaces.length === 0 ? (
        <div className="py-8 px-4 rounded-2xl border border-white/[0.06] bg-[#151518]/50 text-center text-xs text-[#AAA69C]">
          No spots found in this category yet.
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1"
        >
          {filteredPlaces.map((place) => (
            <div key={place.id || place.slug} className="w-[280px] sm:w-[310px] shrink-0">
              <PlaceCard place={place} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TopRatedSection;
