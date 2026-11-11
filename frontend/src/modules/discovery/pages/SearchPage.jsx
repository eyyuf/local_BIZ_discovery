import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { discoveryApi } from '../api/discoveryApi';
import { PlaceCard } from '@/modules/places/components/PlaceCard';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function fetchSearch() {
      try {
        const q = searchParams.get('q') || '';
        const data = await discoveryApi.searchPlaces({ q });
        if (!isMounted) return;
        setResults(data?.data || data || []);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header and Search Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-full border border-white/20 bg-black/40 text-[#AAA69C] hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
            Discover Spots &amp; Venues
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="relative max-w-xl">
          <Search className="w-4 h-4 text-[#AAA69C] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, neighborhood, or food..."
            className="w-full h-12 rounded-full border border-white/20 bg-[#151513] pl-11 pr-24 text-xs sm:text-sm text-[#F5F2EA] placeholder:text-[#AAA69C]/60 focus:border-white focus:outline-none transition font-sans"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-[#F5F2EA] transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between border-b border-[#34322D] pb-3 text-xs text-[#AAA69C]">
        <span>
          Showing {results.length} spot{results.length === 1 ? '' : 's'}
          {searchParams.get('q') ? ` for "${searchParams.get('q')}"` : ''}
        </span>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#AAA69C]">Searching places...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="text-sm text-[#AAA69C]">No matching spots found. Try searching for "Bole", "Bishoftu", or "Coffee".</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSearchParams({});
            }}
            className="px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white hover:border-white"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Results Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {results.map((place) => (
            <PlaceCard key={place.id || place.slug} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPage;
