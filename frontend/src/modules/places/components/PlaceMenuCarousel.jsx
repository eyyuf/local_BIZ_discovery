import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Info,
} from 'lucide-react';
import { PLACE_PLACEHOLDER } from '@/shared/utils/placeImages';

export function PlaceMenuCarousel({ menuSections = [] }) {
  const [selectedSectionId, setSelectedSectionId] = useState('all');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const sliderRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Normalize sections and gather items
  const validSections = Array.isArray(menuSections) ? menuSections : [];
  const allItems = validSections.flatMap((section) =>
    (section.items || []).map((item) => ({
      ...item,
      sectionName: section.name,
    }))
  );

  // Filtered items based on selected section pill
  const filteredItems =
    selectedSectionId === 'all'
      ? allItems
      : allItems.filter(
          (item) => String(item.menu_section_id) === String(selectedSectionId)
        );

  const updateScrollButtons = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = sliderRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [filteredItems, updateScrollButtons]);

  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white font-display tracking-tight">
                Menu &amp; Offerings
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#AAA69C]">
                {filteredItems.length} {filteredItems.length === 1 ? 'Dish' : 'Dishes'}
              </span>
            </div>
            <p className="text-xs text-[#AAA69C] hidden sm:block">
              Explore authentic kitchen specialties, pricing, and ingredients.
            </p>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={slideLeft}
            disabled={!canScrollLeft}
            aria-label="Scroll menu left"
            className="w-8 h-8 rounded-full border border-white/15 bg-black/50 hover:bg-black/90 hover:border-white/30 text-white flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={slideRight}
            disabled={!canScrollRight}
            aria-label="Scroll menu right"
            className="w-8 h-8 rounded-full border border-white/15 bg-black/50 hover:bg-black/90 hover:border-white/30 text-white flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Filter Pills (if more than 1 section exists) */}
      {validSections.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedSectionId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap border ${
              selectedSectionId === 'all'
                ? 'border-white bg-white/15 text-white shadow-sm font-semibold'
                : 'border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/25'
            }`}
          >
            All Dishes ({allItems.length})
          </button>
          {validSections.map((sec) => {
            const count = (sec.items || []).length;
            const isSelected = String(selectedSectionId) === String(sec.id);
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSectionId(sec.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'border-white bg-white/15 text-white shadow-sm font-semibold'
                    : 'border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/25'
                }`}
              >
                {sec.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Horizontal Sliding Track */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-0.5 snap-x snap-mandatory"
      >
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveModalItem(item)}
            className="w-[260px] sm:w-[280px] shrink-0 snap-start bg-[#151518] border border-white/[0.08] hover:border-white/20 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group cursor-pointer"
          >
            <div>
              {/* Dish Image Container */}
              <div className="relative aspect-[16/10] w-full bg-[#1D1C19] overflow-hidden select-none">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACE_PLACEHOLDER;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#AAA69C]/40 bg-gradient-to-br from-black/60 to-black/90">
                    <UtensilsCrossed className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#AAA69C]/60">
                      Authentic Dish
                    </span>
                  </div>
                )}

                {/* Subtle bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

                {/* Price Badge on Photo */}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-white shadow-md">
                  {Number(item.price).toFixed(2)} ETB
                </div>

                {/* Sold Out / Status Tag */}
                {!item.is_available && (
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-red-500/30 text-[10px] font-mono text-red-300 shadow-md">
                    Sold Out
                  </div>
                )}
              </div>

              {/* Dish Meta Content */}
              <div className="p-4 space-y-1.5">
                {item.sectionName && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#AAA69C]/80 block truncate">
                    {item.sectionName}
                  </span>
                )}
                <h3 className="text-sm font-bold text-white font-display truncate group-hover:text-white transition">
                  {item.name}
                </h3>
                {item.description ? (
                  <p className="text-xs text-[#AAA69C] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                ) : (
                  <p className="text-xs text-[#AAA69C]/50 italic">
                    Freshly prepared specialty.
                  </p>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 pb-3.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#AAA69C]">
              <span className="font-mono">
                {item.is_available ? 'Available Now' : 'Currently Unavailable'}
              </span>
              <span className="text-white/60 group-hover:text-white transition text-xs font-medium flex items-center gap-0.5">
                Details &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Dish Quick Detail Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="bg-[#151518] border border-white/15 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image */}
            {activeModalItem.image_url ? (
              <div className="relative aspect-[16/10] w-full bg-black/60">
                <img
                  src={activeModalItem.image_url}
                  alt={activeModalItem.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACE_PLACEHOLDER;
                  }}
                />
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#AAA69C]">
                  Dish Details
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="p-1 rounded-full text-[#AAA69C] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                {activeModalItem.sectionName && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#AAA69C]">
                    {activeModalItem.sectionName}
                  </span>
                )}
                <div className="flex items-baseline justify-between gap-3 mt-1">
                  <h3 className="text-lg font-bold text-white font-display">
                    {activeModalItem.name}
                  </h3>
                  <span className="text-base font-mono font-bold text-white shrink-0">
                    {Number(activeModalItem.price).toFixed(2)} ETB
                  </span>
                </div>
              </div>

              {activeModalItem.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-mono uppercase text-[#AAA69C]">Description &amp; Notes</h4>
                  <p className="text-xs sm:text-sm text-[#F5F2EA]/90 leading-relaxed">
                    {activeModalItem.description}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                <span className="text-[#AAA69C]">Availability Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] inline-flex items-center gap-1.5 border ${
                    activeModalItem.is_available
                      ? 'border-white/10 bg-white/5 text-white'
                      : 'border-red-500/20 bg-red-950/20 text-red-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeModalItem.is_available ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                  />
                  <span>{activeModalItem.is_available ? 'Available' : 'Sold Out'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaceMenuCarousel;

