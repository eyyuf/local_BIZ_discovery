import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, LocateFixed, ArrowLeft, Star, AlertTriangle, RefreshCw } from 'lucide-react';
import { discoveryApi } from '../api/discoveryApi';
import { LeafletMap } from '@/shared/map/LeafletMap';
import { BookmarkButton } from '@/modules/bookmarks/components/BookmarkButton';
import { getPlacePrimaryPhoto, PLACE_PLACEHOLDER } from '@/shared/utils/placeImages';
import { getPlaceCategoryLabel } from '@/shared/utils/placeCategories';

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

// Derive category label with simplified terminology
function getCategoryLabel(place) {
  return getPlaceCategoryLabel(place);
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
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);

  const radiusOptions = [2, 5, 10, 25];

  // Mobile Bottom Sheet interaction states: 'collapsed' | 'expanded'
  const [sheetState, setSheetState] = useState('collapsed');
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragSourceRef = useRef(null);
  const listRef = useRef(null);

  // Desktop detection for layout switching
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gesture handling for mobile bottom sheet
  const handleDragStart = (clientY, source) => {
    if (isDesktop) return;
    startYRef.current = clientY;
    dragSourceRef.current = source;
    isDraggingRef.current = false;
    didDragRef.current = false;
  };

  const handleDragMove = useCallback(
    (clientY) => {
      if (isDesktop || !startYRef.current) return;
      const deltaY = clientY - startYRef.current;

      // When dragging from places list: only allow downward drag if scrolled to top
      if (dragSourceRef.current === 'list' && sheetState === 'expanded') {
        const scrollTop = listRef.current ? listRef.current.scrollTop : 0;
        if (scrollTop > 0 || deltaY < 0) {
          return;
        }
      }

      if (Math.abs(deltaY) > 8) {
        isDraggingRef.current = true;
        didDragRef.current = true;
        setIsDragging(true);

        // Add resistance when pulling beyond bounds
        if (sheetState === 'collapsed' && deltaY > 0) {
          setDragY(deltaY * 0.2);
        } else if (sheetState === 'expanded' && deltaY < 0) {
          setDragY(deltaY * 0.2);
        } else {
          setDragY(deltaY);
        }
      }
    },
    [isDesktop, sheetState]
  );

  const handleDragEnd = useCallback(() => {
    if (isDesktop) return;
    if (isDraggingRef.current) {
      if (sheetState === 'collapsed' && dragY < -35) {
        setSheetState('expanded');
      } else if (sheetState === 'expanded' && dragY > 35) {
        setSheetState('collapsed');
      }
    }
    setIsDragging(false);
    setDragY(0);
    startYRef.current = 0;
    isDraggingRef.current = false;
    dragSourceRef.current = null;
    setTimeout(() => {
      didDragRef.current = false;
    }, 100);
  }, [isDesktop, sheetState, dragY]);

  // Window-level move and end listeners to ensure smooth dragging even outside handle
  useEffect(() => {
    if (isDesktop) return;

    const onPointerMove = (e) => {
      if (startYRef.current) {
        handleDragMove(e.clientY);
      }
    };

    const onPointerUp = () => {
      if (startYRef.current) {
        handleDragEnd();
      }
    };

    const onTouchMove = (e) => {
      if (startYRef.current && e.touches && e.touches[0]) {
        handleDragMove(e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      if (startYRef.current) {
        handleDragEnd();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDesktop, handleDragMove, handleDragEnd]);

  // Prevent link navigation if the action was a swipe/drag gesture
  const handleCardClick = (e) => {
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const collapsedVisibleHeight = 280;
  const mobileTransform = isDragging
    ? sheetState === 'collapsed'
      ? `translateY(calc(100% - ${collapsedVisibleHeight}px + ${dragY}px))`
      : `translateY(${Math.max(0, dragY)}px)`
    : sheetState === 'collapsed'
      ? `translateY(calc(100% - ${collapsedVisibleHeight}px))`
      : 'translateY(0px)';

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
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pt-16 sm:pt-20 lg:pt-24 pb-16 px-3 sm:px-6 lg:px-8 max-w-7xl xl:max-w-[1560px] mx-auto space-y-3 sm:space-y-4">
      {/* Top Compact Navigation & Status Bar */}
      <div className="flex items-center justify-between gap-2.5 bg-[#151518]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl px-3.5 py-2 sm:py-2.5 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            to="/"
            className="p-1.5 rounded-full border border-white/20 bg-black/40 text-[#AAA69C] hover:text-white transition shrink-0"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-xs text-[#AAA69C] truncate">
            <span className="hidden sm:inline">Center: </span>
            <span className="text-white font-mono font-medium text-[11px] sm:text-xs">
              {coords
                ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                : locationStatus === 'requesting'
                ? 'Detecting GPS location...'
                : 'Location not set'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={requestLocation}
          disabled={locationStatus === 'requesting'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/25 bg-white/10 hover:bg-white hover:text-black text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <LocateFixed
            className={`w-3.5 h-3.5 text-emerald-400 ${
              locationStatus === 'requesting' ? 'animate-spin' : ''
            }`}
          />
          <span className="hidden sm:inline">
            {locationStatus === 'requesting' ? 'Locating...' : 'Update Location'}
          </span>
          <span className="sm:hidden">
            {locationStatus === 'requesting' ? '...' : 'Update'}
          </span>
        </button>
      </div>

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
        <div className="relative h-[calc(100vh-7.5rem)] h-[calc(100dvh-7.5rem)] sm:h-[calc(100vh-8.5rem)] sm:h-[calc(100dvh-8.5rem)] min-h-[500px] rounded-2xl overflow-hidden border border-white/[0.08] lg:border-0 lg:h-auto lg:min-h-0 lg:overflow-visible lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          {/* Map Column: Mounted in the background on mobile, stationary right column (~58%) on desktop */}
          <div className="absolute inset-0 z-0 w-full h-full lg:relative lg:inset-auto lg:order-2 lg:col-span-7 xl:col-span-7 lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)] lg:space-y-2.5 lg:flex lg:flex-col lg:z-auto">
            {/* Desktop Radius Selector Controls positioned directly above map (hidden on mobile, rendered inside sheet on mobile) */}
            <div className="hidden lg:flex items-center gap-2 bg-[#151518] border border-white/[0.08] rounded-xl px-3.5 py-2 shrink-0">
              <span className="text-xs font-mono text-[#AAA69C]/80 shrink-0">Radius:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {radiusOptions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadius(r)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer ${
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

            {/* Leaflet Map: full viewport container on mobile, flex-1 on desktop */}
            <div className="w-full h-full lg:flex-1 lg:h-full lg:min-h-[320px]">
              <LeafletMap
                lat={coords.lat}
                lng={coords.lng}
                name="Current GPS Location"
                address={`GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`}
                zoom={13}
                radius={radius}
                markers={places}
                selectedPlaceId={selectedPlaceId || hoveredPlaceId}
                onSelectMarker={(place) => {
                  const pId = place.id || place.slug;
                  setSelectedPlaceId(pId);
                  const cardEl = document.getElementById(`nearby-place-card-${pId}`);
                  if (cardEl && listRef.current) {
                    cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }}
                showCenterPin={true}
                className="!h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              />
            </div>
          </div>

          {/* Left Column / Draggable Bottom Sheet: Foreground sheet on mobile (~98% when expanded, 280px when collapsed), left column (~42%) on desktop */}
          <div
            className={`absolute inset-x-0 bottom-0 z-20 h-[calc(100%-0.5rem)] rounded-t-[28px] bg-[#151518] border-t border-x border-white/[0.12] shadow-2xl flex flex-col px-3.5 sm:px-5 pt-1.5 pb-3 lg:relative lg:inset-auto lg:bottom-auto lg:z-auto lg:order-1 lg:col-span-5 xl:col-span-5 lg:h-auto lg:max-h-[calc(100vh-6.5rem)] lg:rounded-none lg:bg-transparent lg:border-0 lg:p-0 lg:shadow-none lg:space-y-3.5 ${
              isDesktop ? 'lg:!transform-none' : ''
            }`}
            style={
              isDesktop
                ? undefined
                : {
                    transform: mobileTransform,
                    transition: isDragging
                      ? 'none'
                      : 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }
            }
          >
            {/* Mobile Sheet Drag Handle Bar (touch-action none, acts as primary drag handle and toggle) */}
            <div
              className="pt-1.5 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none lg:hidden"
              onPointerDown={(e) => handleDragStart(e.clientY, 'handle')}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientY, 'handle')}
              onClick={() => setSheetState((s) => (s === 'collapsed' ? 'expanded' : 'collapsed'))}
              role="button"
              aria-label={sheetState === 'collapsed' ? 'Expand places sheet' : 'Collapse places sheet'}
            >
              <div className="w-12 h-1.5 bg-white/30 hover:bg-white/50 active:bg-white/70 rounded-full transition-colors mb-1" />
            </div>

            {/* Mobile Radius Filter Row positioned at the top of results sheet */}
            <div
              className="lg:hidden flex items-center justify-between gap-2 pb-2 overflow-x-auto no-scrollbar border-b border-white/[0.06] shrink-0"
              onPointerDown={(e) => {
                if (e.target.tagName !== 'BUTTON') {
                  handleDragStart(e.clientY, 'header');
                }
              }}
              onTouchStart={(e) => {
                if (e.target.tagName !== 'BUTTON') {
                  handleDragStart(e.touches[0].clientY, 'header');
                }
              }}
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-mono text-[#AAA69C]/80 shrink-0">Radius:</span>
                {radiusOptions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadius(r)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer shrink-0 ${
                      radius === r
                        ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'border border-white/10 bg-black/30 text-[#AAA69C] hover:text-white hover:border-white/30'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSheetState((s) => (s === 'collapsed' ? 'expanded' : 'collapsed'))}
                className="text-[11px] font-mono text-[#AAA69C] hover:text-white px-2.5 py-1 rounded-full border border-white/10 bg-white/5 shrink-0 cursor-pointer transition active:scale-95"
              >
                {sheetState === 'collapsed' ? 'Expand ↑' : 'Collapse ↓'}
              </button>
            </div>

            {/* Results Header within Column */}
            <div
              className="flex items-center justify-between py-2 border-b border-white/[0.06] shrink-0 cursor-grab active:cursor-grabbing lg:cursor-default select-none"
              onPointerDown={(e) => handleDragStart(e.clientY, 'header')}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientY, 'header')}
            >
              <h2 className="text-base font-bold text-white font-display">
                Nearby Places ({places.length})
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
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto lg:overflow-y-auto lg:pr-3 space-y-3.5 pt-2 pb-8 overscroll-contain"
                onPointerDown={(e) => {
                  if (sheetState === 'collapsed') {
                    handleDragStart(e.clientY, 'list');
                  }
                }}
                onTouchStart={(e) => {
                  if (sheetState === 'collapsed') {
                    handleDragStart(e.touches[0].clientY, 'list');
                  } else if (listRef.current && listRef.current.scrollTop === 0) {
                    handleDragStart(e.touches[0].clientY, 'list');
                  }
                }}
              >
                {places.map((place, index) => {
                  const placeId = place.id || place.slug;
                  const photo = getPlacePrimaryPhoto(place);
                  const categoryLabel = getCategoryLabel(place);
                  const formattedDistance = formatDistance(place.distance_km);
                  const hasRating =
                    place?.average_rating != null && Number(place.average_rating) > 0;
                  const isSelected = selectedPlaceId && String(selectedPlaceId) === String(placeId);
                  const isHovered = hoveredPlaceId && String(hoveredPlaceId) === String(placeId);
                  const isActive = isSelected || isHovered;

                  return (
                    <Link
                      key={placeId}
                      id={`nearby-place-card-${placeId}`}
                      to={`/places/${place.slug}`}
                      onClick={(e) => {
                        handleCardClick(e);
                        setSelectedPlaceId(placeId);
                      }}
                      onMouseEnter={() => setHoveredPlaceId(placeId)}
                      onMouseLeave={() => setHoveredPlaceId(null)}
                      className={`group block bg-[#151518] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                        isActive
                          ? 'border-2 border-amber-400 bg-[#1A1A22] shadow-2xl ring-1 ring-amber-400/50'
                          : 'border border-white/[0.08] hover:border-white/25 hover:shadow-2xl'
                      }`}
                    >
                      {/* Image container: full width, compact 16:9 aspect ratio */}
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#1D1C19]">
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

                        {/* Sequential Number matching map marker pin */}
                        <div
                          className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-full font-mono font-black text-xs flex items-center justify-center shadow-md transition-colors ${
                            isActive
                              ? 'bg-amber-400 text-black border border-white'
                              : 'bg-black/80 backdrop-blur-md border border-white/30 text-white'
                          }`}
                        >
                          {index + 1}
                        </div>

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

                      {/* Metadata below image in normal document flow - compact padding & spacing */}
                      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          {/* Name and Rating */}
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition truncate leading-snug"
                              title={place.name}
                            >
                              <span className="text-amber-400 font-mono font-bold mr-1.5">{index + 1}.</span>
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
                            <div className="flex items-center gap-1.5 text-xs text-[#AAA69C] mt-1">
                              <MapPin className="w-3.5 h-3.5 text-[#AAA69C] shrink-0" />
                              <span className="truncate">{place.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom row: Category & Distance */}
                        <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs mt-2">
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
        </div>
      )}
    </div>
  );
}

export default NearbyPage;
