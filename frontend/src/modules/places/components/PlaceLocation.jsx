import React, { useState } from 'react';
import { Copy, Navigation, Check } from 'lucide-react';
import { LeafletMap } from '@/shared/map/LeafletMap';

export function PlaceLocation({ place }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!place?.address) return;
    try {
      await navigator.clipboard.writeText(place.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Ignore
    }
  };

  const handleOpenMaps = () => {
    if (place?.latitude && place?.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`,
        '_blank'
      );
    } else if (place?.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`,
        '_blank'
      );
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#34322D] bg-[#151513]/90 space-y-6">
      {/* Header & Address */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
            Location &amp; Navigation
          </h2>
          <p className="text-xs sm:text-sm text-[#AAA69C]">
            {place?.address || 'Addis Ababa, Ethiopia'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAddress}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/40 text-xs font-semibold text-[#AAA69C] hover:text-white hover:border-white transition active:scale-95 cursor-pointer backdrop-blur-md"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Address</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenMaps}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white bg-transparent text-xs font-bold text-white hover:bg-white/10 transition active:scale-95 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>Open Maps</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map */}
      <LeafletMap
        lat={place?.latitude}
        lng={place?.longitude}
        name={place?.name}
        address={place?.address}
        zoom={15}
      />
    </div>
  );
}

export default PlaceLocation;

