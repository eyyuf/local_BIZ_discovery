import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { discoveryApi } from '@/modules/discovery/api/discoveryApi';
import { useAuth } from '@/modules/identity';
import { PlaceCard } from '@/modules/places/components/PlaceCard';

export function SavedPlacesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [savedPlaces, setSavedPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Sign in to view your saved spots' } });
      return;
    }

    let isMounted = true;
    async function loadBookmarks() {
      try {
        const data = await discoveryApi.getBookmarks();
        if (!isMounted) return;
        setSavedPlaces(data?.data || data || []);
      } catch (err) {
        console.error('Failed to load bookmarks', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBookmarks();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-full border border-white/20 bg-black/40 text-[#AAA69C] hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-white" />
            <span>Saved Collections</span>
          </h1>
          <p className="text-xs text-[#AAA69C] mt-0.5">
            Your personal bookmarks and favorite spots across Addis Ababa &amp; beyond.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#AAA69C]">Loading saved spots...</span>
        </div>
      ) : savedPlaces.length === 0 ? (
        <div className="py-20 text-center space-y-4 glass-card rounded-3xl p-8 border border-[#34322D]">
          <Bookmark className="w-10 h-10 text-white/30 mx-auto" />
          <h2 className="text-base font-bold text-white font-display">No saved spots yet</h2>
          <p className="text-xs text-[#AAA69C] max-w-sm mx-auto">
            Click the bookmark icon on any place card or detail page to save it to your collection.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition"
          >
            Explore Places
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {savedPlaces.map((b) => {
            const placeObj = b.place || b;
            return (
              <PlaceCard
                key={placeObj.id || placeObj.slug || b.id}
                place={placeObj}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SavedPlacesPage;
