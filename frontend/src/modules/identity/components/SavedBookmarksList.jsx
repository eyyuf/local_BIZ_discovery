import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import identityApi from '../api/identityApi';
import { Bookmark, MapPin, ExternalLink, Trash2, Store } from 'lucide-react';

export function SavedBookmarksList() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await identityApi.getBookmarks();
      const items = res.data || res.bookmarks || (Array.isArray(res) ? res : []);
      setBookmarks(items);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (placeId) => {
    setRemovingId(placeId);
    try {
      await identityApi.toggleBookmark(placeId);
      setBookmarks((prev) => prev.filter((b) => (b.place_id || b.place?.id) !== placeId));
    } catch (err) {
      console.error('Failed to remove bookmark', err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <span className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-white/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Bookmark className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No saved places yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
          Browse local cafes, restaurants, and shops, then tap the bookmark icon to save them for quick access.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Store className="w-3.5 h-3.5" />
          Explore Places
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookmarks.map((b) => {
        const place = b.place || b;
        const placeId = place.id || b.place_id;
        const isRemoving = removingId === placeId;

        return (
          <div
            key={placeId}
            className="p-4 rounded-xl border border-slate-200 bg-white/80 hover:bg-white hover:shadow-md transition-all flex items-start gap-3.5"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center text-slate-400">
              {place.thumbnail_url || place.image_url ? (
                <img
                  src={place.thumbnail_url || place.image_url}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                to={`/places/${place.slug || place.id}`}
                className="font-bold text-sm text-slate-900 hover:text-brand-600 truncate block transition"
              >
                {place.name}
              </Link>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                {place.address || 'Address not listed'}
              </p>
              {place.average_rating !== undefined && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-1">
                  ★ {Number(place.average_rating || 0).toFixed(1)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Link
                to={`/places/${place.slug || place.id}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                title="View Place Details"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleRemove(placeId)}
                disabled={isRemoving}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                title="Remove from saved"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SavedBookmarksList;
