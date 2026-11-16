import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import identityApi from '../api/identityApi';
import { Bookmark, MapPin, ExternalLink, Trash2, Store, Star } from 'lucide-react';

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
      <div className="py-16 flex justify-center items-center">
        <span className="w-7 h-7 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-200/90 bg-white/60">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Bookmark className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900">No saved places yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
          Explore local coffee shops, bakeries, and boutiques around your area, then tap the bookmark icon to save them here.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
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
            className="production-card production-card-hover rounded-2xl p-4 flex items-start gap-3.5 group relative"
          >
            <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center text-slate-400">
              {place.thumbnail_url || place.image_url ? (
                <img
                  src={place.thumbnail_url || place.image_url}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Store className="w-7 h-7 text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <Link
                to={`/places/${place.slug || place.id}`}
                className="font-bold text-sm text-slate-900 hover:text-emerald-600 truncate block transition"
              >
                {place.name}
              </Link>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                {place.address || 'Address on file'}
              </p>
              {place.average_rating !== undefined && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-1.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{Number(place.average_rating || 0).toFixed(1)}</span>
                  {place.review_count !== undefined && (
                    <span className="text-slate-400 font-normal">({place.review_count})</span>
                  )}
                </div>
              )}
            </div>

            <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
              <button
                onClick={() => handleRemove(placeId)}
                disabled={isRemoving}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50 cursor-pointer"
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
