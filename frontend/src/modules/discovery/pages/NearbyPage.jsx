import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, LocateFixed, ArrowLeft } from 'lucide-react';
import { discoveryApi } from '../api/discoveryApi';
import { LeafletMap } from '@/shared/map/LeafletMap';
import { BookmarkButton } from '@/modules/bookmarks/components/BookmarkButton';
import { getPlacePrimaryPhoto } from '@/shared/utils/placeImages';

export function NearbyPage() {
  const [selectedCoords, setSelectedCoords] = useState({
    lat: 9.0225,
    lng: 38.831,
    name: 'CMC / Ayat',
  });
  const [radius, setRadius] = useState(10);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const presets = [
    { name: 'Bole Area', lat: 9.0025, lng: 38.7872 },
    { name: 'Kazanchis', lat: 9.0205, lng: 38.7712 },
    { name: 'Piassa', lat: 9.035, lng: 38.752 },
    { name: 'CMC & Ayat', lat: 9.022, lng: 38.83 },
    { name: 'Sarbet', lat: 8.998, lng: 38.739 },
    { name: 'Bishoftu Lakes', lat: 8.752, lng: 38.986 },
  ];

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: 'Current GPS Location',
          });
        },
        (err) => {
          console.warn('Geolocation denied or unavailable', err);
        }
      );
    }
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadNearby() {
      try {
        const data = await discoveryApi.getNearbyPlaces(
          selectedCoords.lat,
          selectedCoords.lng,
          radius
        );
        if (!isMounted) return;
        setPlaces(data?.data || data || []);
      } catch (err) {
        console.error('Failed to load nearby places', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadNearby();
    return () => {
      isMounted = false;
    };
  }, [selectedCoords, radius]);

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-full border border-white/20 bg-black/40 text-[#AAA69C] hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Live Proximity Radar
            </h1>
            <p className="text-xs text-[#AAA69C] mt-0.5">
              Center: <span className="text-white font-medium">{selectedCoords.name}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 hover:bg-white hover:text-black text-xs font-bold transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
          <span>Use My GPS</span>
        </button>
      </div>

      {/* Preset Neighborhood Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs font-mono text-[#AAA69C]/80 shrink-0 mr-1">Areas:</span>
        {presets.map((p) => {
          const isSelected = selectedCoords.name === p.name;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setSelectedCoords(p)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition active:scale-95 ${
                isSelected
                  ? 'border border-white bg-white/15 text-white'
                  : 'border border-white/15 bg-black/30 text-[#AAA69C] hover:text-white hover:border-white/40'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Interactive Proximity Map powered by CARTO */}
      <div className="w-full">
        <LeafletMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          name={selectedCoords.name}
          address="Search Center Area"
          zoom={13}
          markers={places}
          showCenterPin={true}
          className="!h-[340px] sm:!h-[420px]"
        />
      </div>

      {/* Nearby Results List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display">
          Places Within Proximity ({places.length})
        </h2>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs font-mono text-[#AAA69C]">Calculating distances...</span>
          </div>
        ) : places.length === 0 ? (
          <p className="text-xs text-[#AAA69C] py-8 text-center">
            No places found within this radius. Try selecting another area preset.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => {
              const photo = getPlacePrimaryPhoto(place.slug);
              return (
                <Link
                  key={place.id || place.slug}
                  to={`/places/${place.slug}`}
                  className="glass-card rounded-2xl p-3 border border-[#34322D] flex items-center gap-3.5 hover:border-white/50 transition group"
                >
                  <img
                    src={photo}
                    alt={place.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-white/80 transition truncate">
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#AAA69C] mt-1">
                      <MapPin className="w-3 h-3 text-[#AAA69C] shrink-0" />
                      <span className="truncate">{place.address}</span>
                    </div>
                    {place.distance_km && (
                      <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
                        {Number(place.distance_km).toFixed(1)} km away
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NearbyPage;

