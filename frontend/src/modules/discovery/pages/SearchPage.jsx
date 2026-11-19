import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, MapPin, Loader2, Utensils, Coffee, Wine, Croissant, Flame, Sparkles } from 'lucide-react';
import { discoveryApi } from '../api/discoveryApi';
import { PlaceCard } from '@/modules/places/components/PlaceCard';

const CATEGORY_PILLS = [
  { label: 'All Spots', slug: '' },
  { label: 'Restaurants', slug: 'restaurants', icon: Utensils },
  { label: 'Cafes & Coffee', slug: 'cafes', icon: Coffee },
  { label: 'Bars & Lounges', slug: 'bars-nightlife', icon: Wine },
  { label: 'Bakeries', slug: 'bakeries', icon: Croissant },
  { label: 'Traditional', slug: 'traditional-food', icon: Flame },
  { label: 'Fast Food', slug: 'fast-food' },
  { label: 'Juice & Smoothies', slug: 'juice-smoothies' },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Initial fetch on filter change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setPage(1);

    async function fetchSearch() {
      try {
        const q = searchParams.get('q') || '';
        const cat = searchParams.get('category') || '';
        const params = { page: 1, per_page: 24 };
        if (q) params.q = q;
        if (cat) params.category = cat;

        const res = await discoveryApi.searchPlaces(params);
        if (!isMounted) return;

        const places = res?.data || [];
        const total = res?.meta?.total ?? places.length;
        const lastPage = res?.meta?.last_page ?? 1;

        setResults(places);
        setTotalCount(total);
        setHasMore(1 < lastPage);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSearch();
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Load More Handler (Pagination)
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const q = searchParams.get('q') || '';
      const cat = searchParams.get('category') || '';
      const params = { page: nextPage, per_page: 24 };
      if (q) params.q = q;
      if (cat) params.category = cat;

      const res = await discoveryApi.searchPlaces(params);
      const newPlaces = res?.data || [];
      const lastPage = res?.meta?.last_page ?? nextPage;

      setResults((prev) => [...prev, ...newPlaces]);
      setPage(nextPage);
      setHasMore(nextPage < lastPage);
    } catch (err) {
      console.error('Failed to load more places', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (query.trim()) newParams.q = query.trim();
    if (selectedCategory) newParams.category = selectedCategory;
    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    const newParams = {};
    if (query.trim()) newParams.q = query.trim();
    if (slug) newParams.category = slug;
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Title and Map Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-full border border-white/20 bg-black/40 text-[#AAA69C] hover:text-white transition"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
              <span>Discover Spots &amp; Venues</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold">
                {totalCount ? `${totalCount.toLocaleString()} Live` : 'Addis Ababa'}
              </span>
            </h1>
            <p className="text-xs text-[#AAA69C] mt-0.5">
              Explore restaurants, cafes, lounges, and authentic dining across Addis Ababa.
            </p>
          </div>
        </div>

        {/* View on Map Pill Button */}
        <Link
          to="/nearby"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1D9BF0]/15 hover:bg-[#1D9BF0]/25 border border-[#1D9BF0]/40 text-[#1D9BF0] text-xs font-bold transition shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-[#1D9BF0]" />
          <span>View on Interactive Map</span>
        </Link>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl">
        <Search className="w-4 h-4 text-[#AAA69C] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, neighborhood (Bole, Kazanchis, Piassa), or food..."
          className="w-full h-12 rounded-full border border-white/20 bg-[#151513] pl-11 pr-24 text-xs sm:text-sm text-[#F5F2EA] placeholder:text-[#AAA69C]/60 focus:border-white focus:outline-none transition font-sans shadow-inner"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-[#F5F2EA] transition cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_PILLS.map((pill) => {
          const isSelected = selectedCategory === pill.slug;
          const Icon = pill.icon;
          return (
            <button
              key={pill.slug || 'all'}
              type="button"
              onClick={() => handleCategorySelect(pill.slug)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#AAA69C] hover:text-white'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between border-b border-[#34322D] pb-3 text-xs text-[#AAA69C]">
        <span>
          Showing <strong className="text-white">{results.length}</strong> of{' '}
          <strong className="text-white">{totalCount.toLocaleString()}</strong> spot{totalCount === 1 ? '' : 's'}
          {searchParams.get('q') ? ` for "${searchParams.get('q')}"` : ''}
          {selectedCategory ? ` in ${CATEGORY_PILLS.find((p) => p.slug === selectedCategory)?.label || selectedCategory}` : ''}
        </span>

        <Link
          to="/nearby"
          className="hover:text-white underline underline-offset-4 transition flex items-center gap-1"
        >
          <MapPin className="w-3.5 h-3.5 text-[#1D9BF0]" />
          <span>Open Map</span>
        </Link>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#AAA69C]">Searching 1,000+ authentic Addis places...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="text-sm text-[#AAA69C]">No matching spots found. Try searching for "Bole", "Kazanchis", "Coffee", or "Kitfo".</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('');
              setSearchParams({});
            }}
            className="px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white hover:border-white cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {results.map((place) => (
              <PlaceCard key={place.id || place.slug} place={place} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-8 pb-4 flex flex-col items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading more spots...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Load More Spots ({totalCount - results.length} remaining)</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-[#AAA69C]">
                Loaded {results.length} of {totalCount} total venues
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchPage;
