import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placesApi } from '../api/placesApi';
import { PlaceHero } from '../components/PlaceHero';
import { PlaceAtmosphereGallery } from '../components/PlaceAtmosphereGallery';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { PlaceLocation } from '../components/PlaceLocation';
import { PlaceDirectContact } from '../components/PlaceDirectContact';
import { PlaceMenuCarousel } from '../components/PlaceMenuCarousel';
import { PlaceReviewsSection } from '@/modules/reviews/components/PlaceReviewsSection';
import { getPlacePhotos } from '@/shared/utils/placeImages';
import {
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  Clock,
  MapPin,
  MessageSquare,
  UtensilsCrossed,
} from 'lucide-react';

export function PlaceDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadPlace() {
      try {
        const data = await placesApi.getPlace(slug);
        if (!isMounted) return;

        setPlace(data);
        const venuePhotos = getPlacePhotos(data);
        setPhotos(venuePhotos);
        setActivePhotoIndex(0);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err.response?.status === 404
            ? 'This place listing could not be found.'
            : 'Failed to load place details. Please check your connection.'
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPlace();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#AAA69C]">Loading place details...</p>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="w-12 h-12 rounded-full border border-red-500/40 bg-red-950/40 flex items-center justify-center text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display">{error || 'Place Not Found'}</h2>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-[#151513] text-xs font-semibold text-white hover:border-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Discovery</span>
        </button>
      </div>
    );
  }

  const menuSections = place?.menu_sections || place?.menuSections || [];
  const totalMenuItems = menuSections.reduce(
    (acc, sec) => acc + (sec.items?.length || 0),
    0
  );
  const hasMenuItems = totalMenuItems > 0;

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pb-24 overflow-x-hidden">
      {/* 1. Immersive Hero Movement */}
      <PlaceHero
        place={place}
        photos={photos}
        activePhotoIndex={activePhotoIndex}
        onPhotoChange={setActivePhotoIndex}
      />

      {/* Anchor Navigation Bar */}
      <div className="sticky top-16 z-30 bg-[#0D0D0C]/90 backdrop-blur-md border-b border-white/[0.08] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {hasMenuItems && (
            <a
              href="#menu-section"
              className="px-4 py-1.5 rounded-full text-xs font-semibold border border-white/20 bg-white/10 text-white hover:border-white transition whitespace-nowrap flex items-center gap-1.5 shadow-sm"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-white/80" />
              <span>Menu ({totalMenuItems})</span>
            </a>
          )}
          <a
            href="#overview-section"
            className="px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30 transition whitespace-nowrap flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5 text-white/70" />
            <span>Atmosphere</span>
          </a>
          <a
            href="#schedule-section"
            className="px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30 transition whitespace-nowrap flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-white/70" />
            <span>Schedule</span>
          </a>
          <a
            href="#location-section"
            className="px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/30 transition whitespace-nowrap flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-white/70" />
            <span>Map &amp; Contact</span>
          </a>
          <a
            href="#reviews-section"
            className="px-4 py-1.5 rounded-full text-xs font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-400 transition whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Reviews</span>
          </a>
        </div>
      </div>

      {/* 2. Menu Section with Horizontal Sliding (Under Top Hero Image) */}
      {hasMenuItems && (
        <div id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 scroll-mt-28">
          <PlaceMenuCarousel menuSections={menuSections} />
        </div>
      )}

      {/* Main Container for Details: Balanced 2-Column Desktop Editorial Grid */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Atmosphere Gallery, Weekly Schedule & Reviews (7 cols) */}
          <div className="lg:col-span-7 space-y-12">
            <div id="overview-section" className="scroll-mt-28">
              <PlaceAtmosphereGallery
                place={place}
                photos={photos}
                activePhotoIndex={activePhotoIndex}
                onSelectPhoto={setActivePhotoIndex}
              />
            </div>

            <div id="schedule-section" className="scroll-mt-28">
              <WeeklySchedule operatingHours={place.operating_hours || []} />
            </div>

            <div id="reviews-section" className="scroll-mt-28">
              <PlaceReviewsSection place={place} />
            </div>
          </div>

          {/* Right Column: Interactive Map & Direct Contact Actions (5 cols) */}
          <div id="location-section" className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 scroll-mt-28">
            <PlaceLocation place={place} />

            <PlaceDirectContact place={place} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceDetailPage;
