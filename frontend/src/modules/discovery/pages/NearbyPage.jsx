import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, LocateFixed, ArrowLeft, Star, AlertTriangle, RefreshCw } from 'lucide-react';
import { discoveryApi } from '../api/discoveryApi';
import { LeafletMap } from '@/shared/map/LeafletMap';
import { BookmarkButton } from '@/modules/bookmarks/components/BookmarkButton';
import { getPlacePrimaryPhoto, PLACE_PLACEHOLDER } from '@/shared/utils/placeImages';

// Safe distance formatting from API response
function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined || distanceKm === '') {
    return null;
  }
  const dist = Number(distanceKm);
  if (isNaN(dist) || !isFinite(dist)) {
    return null;
  }
  return `${dist.toFixed(1)} km away`;
}

// Derive category label solely from genuine API data (no slug guessing)
function getCategoryLabel(place) {
  if (place?.categories && place.categories.length > 0) {
    const cat = place.categories[0];
    return typeof cat === 'object' ? cat.name : cat;
  }
  if (place?.category) {
    return typeof place.category === 'object' ? place.category.name : place.category;
  }
  return null;
}

export function NearbyPage() {
  // Geolocation states: 'requesting' | 'ready' | 'denied' | 'unavailable' | 'timeout' | 'unsupported'
  const [locationStatus, setLocationStatus] = useState('requesting');
  const [coords, setCoords] = useState(null); // { lat: number, lng: number } | null
  const [locationErrorMessage, setLocationErrorMessage] = useState(null);

  const [radius, setRadius] = useState(10);
  const [places, setPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState(null);

  const radiusOptions = [2, 5, 10, 25];

  // Request browser geolocation without hardcoded fallback coordinates
  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('unsupported');
      setLocationErrorMessage('Geolocation is not supported by your browser.');
      setCoords(null);
      return;
    }

    setLocationStatus('requesting');
    setLocationErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({
          lat: latitude,
          lng: longitude,
        });
        setLocationStatus('ready');
        setLocationErrorMessage(null);
      },
      (err) => {
        let status = 'unavailable';
        let message = 'Unable to determine your current location. Please verify device GPS or network settings.';

        if (err.code === err.PERMISSION_DENIED) {
          status = 'denied';
          message = 'Location permission was denied. Please allow location access in your browser settings to discover places near you.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          status = 'unavailable';
          message = 'Location information is currently unavailable. Please verify device GPS signal.';
        } else if (err.code === err.TIMEOUT) {
          status = 'timeout';
          message = 'The location request timed out. Please try again.';
        }

        setLocationStatus(status);
        setLocationErrorMessage(message);
        setCoords(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  // Request location on initial mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Ref to track latest request to prevent race conditions from overwriting newer results
  const activeRequestIdRef = useRef(0);

  // Fetch nearby places strictly when genuine coordinates are available
  useEffect(() => {
    if (!coords || coords.lat == null || coords.lng == null) {
      setPlaces([]);
      setIsLoadingPlaces(false);
      return;
    }

    const currentRequestId = ++activeRequestIdRef.current;
    setIsLoadingPlaces(true);
    setPlacesError(null);

    async function loadNearby() {
      try {
        const data = await discoveryApi.getNearbyPlaces(
          coords.lat,
          coords.lng,
          radius
        );

        if (currentRequestId !== activeRequestIdRef.current) return;
        setPlaces(data?.data || data || []);
      } catch (err) {
        if (currentRequestId !== activeRequestIdRef.current) return;
        console.error('Failed to load nearby places', err);
        setPlacesError('Could not retrieve places for your current location. Please try again.');
        setPlaces([]);
      } finally {
        if (currentRequestId === activeRequestIdRef.current) {
          setIsLoadingPlaces(false);
        }
      }
    }

    loadNearby();
  }, [coords, radius]);

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pt-24 sm:pt-28 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-full border border-white/20 bg-black/40 text-[#AAA69C] hover:text-white transition"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Live Proximity Radar
            </h1>
            <p className="text-xs text-[#AAA69C] mt-0.5">
              Center:{' '}
              <span className="text-white font-medium">
                {coords
                  ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                  : locationStatus === 'requesting'
                  ? 'Detecting GPS location...'
                  : 'Location not set'}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={requestLocation}
          disabled={locationStatus === 'requesting'}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 hover:bg-white hover:text-black text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
        >
          <LocateFixed
            className={`w-3.5 h-3.5 text-emerald-400 ${
              locationStatus === 'requesting' ? 'animate-spin' : ''
            }`}
          />
          <span>{locationStatus === 'requesting' ? 'Locating...' : 'Update Location'}</span>
        </button>
      </div>

      {/* Radius Selector Controls (rendered only when valid coordinates exist) */}
      {coords && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#AAA69C]/80 shrink-0">Radius:</span>
            <div className="flex items-center gap-1.5">
              {radiusOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 ${
                    radius === r
                      ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'border border-white/10 bg-black/30 text-[#AAA69C] hover:text-white hover:border-white/30'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Geolocation State 1: Requesting location */}
      {locationStatus === 'requesting' && !coords && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center rounded-2xl border border-white/10 bg-black/20 p-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
          <h3 className="text-base font-bold text-white">Acquiring Current Location</h3>
          <p className="text-xs text-[#AAA69C] max-w-sm">
            Please allow browser location permissions if prompted to find spots near your exact coordinates.
          </p>
        </div>
      )}

      {/* Geolocation State 2: Permission denied */}
      {locationStatus === 'denied' && (
        <div className="py-16 px-6 max-w-lg mx-auto text-center rounded-2xl border border-red-500/20 bg-red-500/[0.04] space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Location Access Denied</h3>
            <p className="text-xs text-[#AAA69C] mt-1.5 leading-relaxed">
              {locationErrorMessage ||
                'Location access was denied. Please allow location access in your browser settings to discover places near you.'}
            </p>
          </div>
          <button
            type="button"
            onClick={requestLocation}
            className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Retry Location Request</span>
          </button>
        </div>
      )}

      {/* Geolocation State 3: Unavailable, Timeout, or Unsupported */}
      {(locationStatus === 'unavailable' ||
        locationStatus === 'timeout' ||
        locationStatus === 'unsupported') && (
        <div className="py-16 px-6 max-w-lg mx-auto text-center rounded-2xl border border-white/10 bg-black/30 space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {locationStatus === 'timeout'
                ? 'Location Request Timed Out'
                : locationStatus === 'unsupported'
                ? 'Geolocation Unsupported'
                : 'Location Unavailable'}
            </h3>
            <p className="text-xs text-[#AAA69C] mt-1.5 leading-relaxed">
              {locationErrorMessage ||
                'Unable to detect your device location. Please ensure location services are enabled on your device.'}
            </p>
          </div>
          {locationStatus !== 'unsupported' && (
            <button
              type="button"
              onClick={requestLocation}
              className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* Geolocation State 4: Location obtained and coordinates active */}
      {coords && (
        <>
          {/* Interactive Proximity Map powered by CARTO */}
          <div className="w-full">
            <LeafletMap
              lat={coords.lat}
              lng={coords.lng}
              name="Current GPS Location"
              address={`GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`}
              zoom={13}
              radius={radius}
              markers={places}
              showCenterPin={true}
              className="!h-[340px] sm:!h-[420px]"
            />
          </div>

          {/* Nearby Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-display">
                Places Within Proximity ({places.length})
              </h2>
              <span className="text-xs font-mono text-emerald-400">
                within {radius} km
              </span>
            </div>

            {isLoadingPlaces ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-xs font-mono text-[#AAA69C]">
                  Calculating distances...
                </span>
              </div>
            ) : placesError ? (
              <div className="py-16 text-center rounded-2xl border border-white/10 bg-black/20 p-8 space-y-3">
                <p className="text-sm font-semibold text-red-400">{placesError}</p>
                <button
                  type="button"
                  onClick={() => setRadius((r) => r)}
                  className="px-4 py-2 rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  Retry Search
                </button>
              </div>
            ) : places.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-white/10 bg-black/20 p-8 space-y-2">
                <MapPin className="w-8 h-8 text-[#AAA69C]/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">
                  No places found within {radius} km of your location
                </p>
                <p className="text-xs text-[#AAA69C]">
                  Try expanding the search radius using the options above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {places.map((place) => {
                  const photo = getPlacePrimaryPhoto(place);
                  const categoryLabel = getCategoryLabel(place);
                  const formattedDistance = formatDistance(place.distance_km);
                  const hasRating =
                    place?.average_rating != null && Number(place.average_rating) > 0;

                  return (
                    <Link
                      key={place.id || place.slug}
                      to={`/places/${place.slug}`}
                      className="group block h-full bg-[#151518] border border-white/[0.08] hover:border-white/25 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      {/* Image container: full width, consistent aspect ratio */}
                      <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-[#1D1C19]">
                        <img
                          src={photo}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PLACE_PLACEHOLDER;
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                        {/* Bookmark Button (top right) */}
                        <div
                          className="absolute top-2.5 right-2.5 z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <BookmarkButton
                            placeId={place.id}
                            size="sm"
                            initialBookmarked={Boolean(place.is_bookmarked)}
                          />
                        </div>
                      </div>

                      {/* Metadata below image in normal document flow */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          {/* Name and Rating */}
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition truncate leading-snug"
                              title={place.name}
                            >
                              {place.name}
                            </h3>
                            {hasRating && (
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0 mt-0.5">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{Number(place.average_rating).toFixed(1)}</span>
                                {place.total_ratings > 0 && (
                                  <span className="text-[#AAA69C] font-normal text-[11px]">
                                    ({place.total_ratings})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Address / Location */}
                          {place.address && (
                            <div className="flex items-center gap-1.5 text-xs text-[#AAA69C] mt-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#AAA69C] shrink-0" />
                              <span className="truncate">{place.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom row: Category & Distance */}
                        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs mt-3">
                          {categoryLabel && (
                            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-white/90 text-[11px] font-semibold border border-white/10 truncate max-w-[140px]">
                              {categoryLabel}
                            </span>
                          )}

                          {formattedDistance && (
                            <span className="font-mono text-emerald-400 font-bold text-xs flex items-center gap-1 shrink-0 ml-auto">
                              <LocateFixed className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{formattedDistance}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NearbyPage;
