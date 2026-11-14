import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import { BookmarkButton } from '@/modules/bookmarks/components/BookmarkButton';
import { getPlacePhotos, PLACE_PLACEHOLDER } from '@/shared/utils/placeImages';

export function PlaceCard({ place, rank = null, className = '' }) {
  const photos = getPlacePhotos(place);
  const [photoIndex, setPhotoIndex] = useState(0);
  const totalPhotos = photos.length > 0 ? photos.length : 1;

  const handlePrevPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const handleNextPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % totalPhotos);
  };

  // Derive neighborhood / area
  const getNeighborhood = () => {
    if (place?.neighborhood) return place.neighborhood;
    const address = place?.address || '';
    if (address.toLowerCase().includes('bishoftu')) return 'Bishoftu';
    if (address.toLowerCase().includes('bole')) return 'Bole Area';
    if (address.toLowerCase().includes('piassa')) return 'Piassa';
    if (address.toLowerCase().includes('sarbet')) return 'Sarbet';
    if (address.toLowerCase().includes('kazanchis')) return 'Kazanchis';
    if (address.toLowerCase().includes('cmc')) return 'CMC Village';
    if (address.toLowerCase().includes('ayat')) return 'Ayat';
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 2].trim() : 'Addis Ababa';
  };

  // Derive primary category
  const getCategoryLabel = () => {
    if (place?.categories && place.categories.length > 0) {
      return place.categories[0].name || place.categories[0];
    }
    const slug = (place?.slug || '').toLowerCase();
    if (slug.includes('bakery') || slug.includes('pastry') || slug.includes('crust')) return 'Artisan Bakery';
    if (slug.includes('coffee') || slug.includes('roaster') || slug.includes('cafe')) return 'Specialty Cafe';
    if (slug.includes('resort') || slug.includes('hotel') || slug.includes('inn') || slug.includes('suites')) return 'Boutique Stay';
    if (slug.includes('fish') || slug.includes('kitchen') || slug.includes('bistro') || slug.includes('grill') || slug.includes('dining')) return 'Cultural Dining';
    return 'Dining & Cafe';
  };

  // Real rating score and review count only - no fabricated data
  const getRatingInfo = () => {
    const rawRating = Number(place?.average_rating);
    const rawCount = Number(place?.total_ratings);
    if (!isNaN(rawRating) && rawRating > 0) {
      return {
        hasRating: true,
        rating: rawRating.toFixed(1),
        count: !isNaN(rawCount) && rawCount >= 0 ? rawCount : 0,
      };
    }
    return {
      hasRating: false,
      rating: null,
      count: 0,
    };
  };

  // Real snippet from place description or address - no fake keywords
  const getHighlightSnippet = () => {
    if (place?.description?.trim()) {
      return place.description.trim();
    }
    if (place?.address?.trim()) {
      return place.address.trim();
    }
    return '';
  };

  const neighborhood = getNeighborhood();
  const categoryLabel = getCategoryLabel();
  const { hasRating, rating, count } = getRatingInfo();
  const highlightSnippet = getHighlightSnippet();
  const isOpen = place?.is_open !== undefined ? Boolean(place.is_open) : null;

  // Clean description: 1 line max, no boilerplate
  const description = (place?.description || '').trim();

  return (
    <Link
      to={`/places/${place?.slug}`}
      className={`group block h-full select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-2xl ${className}`}
    >
      <div className="h-full bg-[#151518] border border-white/[0.08] group-hover:border-white/25 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl flex flex-col">
        {/* 1. Hero Image Container (aspect 4:3, ~60-65% height) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1D1C19] select-none">
          <img
            src={photos[photoIndex] || photos[0]}
            alt={place?.name || 'Local Spot'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACE_PLACEHOLDER;
            }}
          />

          {/* Subtle bottom gradient scrim (bottom 25% only) */}
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none" />

          {/* Desktop Hover Gallery Arrows (32px circles vertically centered at edges) */}
          {totalPhotos > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                aria-label="Previous photo"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                aria-label="Next photo"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 cursor-pointer shadow-md"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Rank Badge (if in Trending mode) */}
          {rank !== null && (
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1 shadow-md">
              <span className="text-[#F5B301]">#{rank}</span>
            </div>
          )}

          {/* Bookmark Button (Top-Right, circular glass button, stops propagation) */}
          <div
            className="absolute top-3 right-3 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <BookmarkButton
              placeId={place?.id}
              size="sm"
              initialBookmarked={Boolean(place?.is_bookmarked)}
            />
          </div>

          {/* Open/Closed Badge (Bottom-Left Pill, only if status available) */}
          {isOpen !== null && (
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-semibold text-[#F5F5F7] border border-white/10 shadow-sm">
              {isOpen ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  <span>Open now</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Closed</span>
                </>
              )}
            </div>
          )}

          {/* Photo Counter (Bottom-Right Pill, only if multiple photos) */}
          {totalPhotos > 1 && (
            <div className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-mono text-[#F5F5F7] border border-white/10 shadow-sm">
              {photoIndex + 1}/{totalPhotos}
            </div>
          )}
        </div>

        {/* 2. Structured, Concise Text Block (Yelp-style hierarchy in dark obsidian) */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
          <div>
            {/* Line 1: Place Name */}
            <h3
              className="text-[17px] font-bold text-white truncate leading-snug group-hover:text-white transition-colors"
              title={place?.name}
            >
              {place?.name}
            </h3>

            {/* Line 2: Rating Stars + Numeric Rating + Review Count (Actual data only) */}
            <div className="flex items-center gap-2 pt-1">
              {hasRating ? (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#F5B301] text-[#F5B301]" />
                    <span className="font-bold text-white text-xs">{rating}</span>
                  </div>
                  <span className="text-[#AAA69C] text-xs">
                    ({count} {count === 1 ? 'review' : 'reviews'})
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#AAA69C]">
                  <Star className="w-3 h-3 text-white/30" />
                  <span className="text-white/50 text-[11px]">No reviews yet</span>
                </div>
              )}
            </div>

            {/* Line 3: Category Pill Badge + Neighborhood */}
            <div className="flex items-center gap-2 pt-1 text-xs text-[#AAA69C] flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-white/90 text-[11px] font-semibold border border-white/10">
                {categoryLabel}
              </span>
              {neighborhood && (
                <>
                  <span>&bull;</span>
                  <span className="truncate max-w-[150px]">{neighborhood}</span>
                </>
              )}
            </div>
          </div>

          {/* Line 4: Clean Highlight / Snippet (from real description/address) */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-[#AAA69C] truncate max-w-[200px]" title={highlightSnippet || place?.name}>
              {highlightSnippet || 'Local business'}
            </span>

            {/* Subtle Action Pill */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/80 group-hover:text-white transition-colors shrink-0">
              <span>View</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PlaceCard;