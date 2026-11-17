import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Share2,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Phone,
  MessageCircle,
  Bookmark,
  Check,
} from 'lucide-react';
import { BookmarkButton } from '@/modules/bookmarks/components/BookmarkButton';
import { PLACE_PLACEHOLDER } from '@/shared/utils/placeImages';

export function PlaceHero({
  place,
  photos = [],
  activePhotoIndex = 0,
  onPhotoChange,
}) {
  const navigate = useNavigate();
  const [copiedShare, setCopiedShare] = useState(false);

  const totalPhotos = photos.length > 0 ? photos.length : 1;
  const currentPhoto = photos[activePhotoIndex] || photos[0];

  const handlePrevPhoto = () => {
    if (totalPhotos <= 1) return;
    const nextIndex = (activePhotoIndex - 1 + totalPhotos) % totalPhotos;
    onPhotoChange(nextIndex);
  };

  const handleNextPhoto = () => {
    if (totalPhotos <= 1) return;
    const nextIndex = (activePhotoIndex + 1) % totalPhotos;
    onPhotoChange(nextIndex);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place?.name || 'Local Spot ET',
          url: window.location.href,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (e) {
      // Ignored
    }
  };

  const handleDirections = () => {
    if (place?.latitude && place?.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
        '_blank'
      );
    } else if (place?.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`,
        '_blank'
      );
    }
  };

  const handleWhatsApp = () => {
    if (place?.phone) {
      const cleanPhone = place.phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const neighborhood =
    place?.address?.split(',')?.slice(-2)?.join(',')?.trim() || 'Addis Ababa';

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-[#151513] select-none">
      {/* Background Hero Image */}
      <img
        src={currentPhoto}
        alt={place?.name || 'Place atmosphere'}
        className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out"
        loading="eager"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = PLACE_PLACEHOLDER;
        }}
      />

      {/* Multi-tier gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none" />

      {/* Top Floating Controls */}
      <div className="absolute top-6 inset-x-0 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Back & Home */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/45 backdrop-blur-md text-xs font-semibold text-white hover:border-white hover:bg-black/70 transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <Link
            to="/"
            aria-label="Home"
            className="w-8 h-8 rounded-full border border-white/20 bg-black/45 backdrop-blur-md text-white hover:border-white hover:bg-black/70 flex items-center justify-center transition active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Right: Share & Photo Counter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share spot"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/45 backdrop-blur-md text-xs font-semibold text-white hover:border-white hover:bg-black/70 transition active:scale-95 cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          {totalPhotos > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/20 bg-black/45 backdrop-blur-md text-xs font-mono text-[#AAA69C]">
              <button
                type="button"
                onClick={handlePrevPhoto}
                aria-label="Previous photo"
                className="hover:text-white p-0.5 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] px-1 text-white">
                {activePhotoIndex + 1} / {totalPhotos}
              </span>
              <button
                type="button"
                onClick={handleNextPhoto}
                aria-label="Next photo"
                className="hover:text-white p-0.5 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Content Overlay */}
      <div className="absolute bottom-8 inset-x-0 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight text-border-letters font-display max-w-4xl">
          {place?.name}
        </h1>

        {/* Status & Location line */}
        <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
          <div className="inline-flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Open Now</span>
          </div>
          <span className="text-white/40">&bull;</span>
          <span className="text-[#AAA69C]">{neighborhood}</span>
        </div>

        {/* Action Dock (Directions, Call, WhatsApp, Save Spot) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleDirections}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] active:scale-95 transition shadow-lg cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 fill-black" />
            <span>Directions</span>
          </button>

          {place?.phone && (
            <a
              href={`tel:${place.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/25 bg-black/45 backdrop-blur-md text-white text-xs font-semibold hover:border-white hover:bg-black/70 active:scale-95 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call {place.phone}</span>
            </a>
          )}

          {place?.phone && (
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/25 bg-black/45 backdrop-blur-md text-white text-xs font-semibold hover:border-white hover:bg-black/70 active:scale-95 transition cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>
          )}

          <div className="inline-flex">
            <BookmarkButton
              placeId={place?.id}
              initialBookmarked={Boolean(place?.is_bookmarked)}
              className="px-4 py-2.5 !w-auto !rounded-full text-xs font-semibold flex items-center gap-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceHero;

