import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placesApi } from '../api/placesApi';
import { PlaceHero } from '../components/PlaceHero';
import { PlaceAtmosphereGallery } from '../components/PlaceAtmosphereGallery';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { PlaceLocation } from '../components/PlaceLocation';
import { PlaceDirectContact } from '../components/PlaceDirectContact';
import { getPlacePhotos } from '@/shared/utils/placeImages';
import { AlertCircle, ArrowLeft } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pb-24 overflow-x-hidden">
      {/* 1. Immersive Hero Movement */}
      <PlaceHero
        place={place}
        photos={photos}
        activePhotoIndex={activePhotoIndex}
        onPhotoChange={setActivePhotoIndex}
      />

      {/* Main Container for Details: Balanced 2-Column Desktop Editorial Grid */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Atmosphere Gallery & Weekly Operating Schedule (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <PlaceAtmosphereGallery
              place={place}
              photos={photos}
              activePhotoIndex={activePhotoIndex}
              onSelectPhoto={setActivePhotoIndex}
            />

            <WeeklySchedule operatingHours={place.operating_hours || []} />
          </div>

          {/* Right Column: Interactive Map & Direct Contact Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8">
            <PlaceLocation place={place} />

            <PlaceDirectContact place={place} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceDetailPage;
