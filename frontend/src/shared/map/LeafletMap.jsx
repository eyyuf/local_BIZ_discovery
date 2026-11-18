import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { getPlaceCategoryLabel } from '@/shared/utils/placeCategories';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Detects overlapping or nearly identical coordinates (< ~15m)
 * and applies visual-only radial displacement so all markers remain individually accessible.
 * Original coordinates inside place objects are strictly preserved.
 */
function getDisplacedCoordinates(places) {
  const coordsMap = new Map();

  places.forEach((place, index) => {
    const lat = parseFloat(place.latitude);
    const lng = parseFloat(place.longitude);
    // Key by ~15m threshold (4 decimal places)
    const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;

    if (!coordsMap.has(key)) {
      coordsMap.set(key, []);
    }
    coordsMap.get(key).push({ place, index, lat, lng });
  });

  const result = [];

  coordsMap.forEach((group) => {
    if (group.length === 1) {
      const item = group[0];
      result.push({
        place: item.place,
        rank: item.index + 1,
        lat: item.lat,
        lng: item.lng,
        isDisplaced: false,
      });
    } else {
      // Small visual radial displacement (~22 meters)
      const radiusDeg = 0.0002;
      group.forEach((item, i) => {
        const angle = (2 * Math.PI * i) / group.length;
        const displacedLat = item.lat + radiusDeg * Math.cos(angle);
        const displacedLng =
          item.lng + (radiusDeg * Math.sin(angle)) / Math.cos((item.lat * Math.PI) / 180);

        result.push({
          place: item.place,
          rank: item.index + 1,
          lat: displacedLat,
          lng: displacedLng,
          isDisplaced: true,
        });
      });
    }
  });

  result.sort((a, b) => a.rank - b.rank);
  return result;
}

/**
 * Creates Yelp-inspired numbered & category-accented custom Leaflet DivIcons.
 */
function createNumberedPlaceIcon({ rank, categoryName, isSelected = false, placeName = '' }) {
  const cat = (categoryName || '').toLowerCase();

  // Category-specific color accents
  let categoryColor = '#EF4444'; // Red for Restaurants (Yelp signature)
  if (cat.includes('cafe') || cat.includes('coffee')) {
    categoryColor = '#F59E0B'; // Amber for Cafes
  } else if (cat.includes('bakery') || cat.includes('pastry')) {
    categoryColor = '#EAB308'; // Warm Yellow for Bakeries
  } else if (cat.includes('hotel') || cat.includes('resort') || cat.includes('inn') || cat.includes('suites')) {
    categoryColor = '#3B82F6'; // Blue for Hotels
  } else if (cat.includes('spa') || cat.includes('wellness')) {
    categoryColor = '#10B981'; // Emerald for Spas
  } else if (cat.includes('gym') || cat.includes('fitness')) {
    categoryColor = '#8B5CF6'; // Purple for Gyms
  }

  const width = isSelected ? 38 : 32;
  const height = isSelected ? 48 : 40;
  const pinFill = isSelected ? '#F5B301' : '#16161A';
  const strokeColor = '#FFFFFF';
  const strokeWidth = isSelected ? '2.5' : '1.5';
  const circleFill = isSelected ? '#0D0D0C' : categoryColor;
  const textFill = isSelected ? '#F5B301' : '#FFFFFF';
  const fontSize = isSelected ? 12 : 11;
  const circleRadius = isSelected ? 12 : 10;

  return L.divIcon({
    className: `custom-place-marker ${isSelected ? 'marker-selected' : ''}`,
    html: `
      <div style="position: relative; transform: translate(-50%, -100%); cursor: pointer; transition: transform 0.2s ease;">
        ${
          isSelected && placeName
            ? `<div style="position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 6px; white-space: nowrap; background: #16161A; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 4px 14px rgba(0,0,0,0.7); pointer-events: none; z-index: 10001;">${escapeHtml(placeName)}</div>`
            : ''
        }
        <div style="filter: ${
          isSelected
            ? 'drop-shadow(0 0 10px rgba(245,179,1,0.85)) drop-shadow(0 6px 12px rgba(0,0,0,0.7))'
            : 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'
        };">
          <svg width="${width}" height="${height}" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 17 42 17 42C17 42 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="${pinFill}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
            <circle cx="17" cy="16" r="${circleRadius}" fill="${circleFill}"/>
            <text x="17" y="20" text-anchor="middle" fill="${textFill}" font-size="${fontSize}" font-weight="900" font-family="system-ui, -apple-system, sans-serif">${rank}</text>
          </svg>
        </div>
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
  });
}

/**
 * Custom Star Pin Icon for Single Place Views (e.g. PlaceLocation details or create picker)
 */
function createSinglePlaceIcon(isSelected = false) {
  const width = isSelected ? 38 : 32;
  const height = isSelected ? 48 : 42;
  return L.divIcon({
    className: 'custom-single-place-pin',
    html: `
      <div style="transform: translate(-50%, -100%); cursor: pointer; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
        <svg width="${width}" height="${height}" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16C0 26.5 16 42 16 42C16 42 32 26.5 32 16C32 7.16 24.84 0 16 0Z" fill="#16161A" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="16" cy="16" r="10" fill="#F5B301"/>
          <path d="M16 9.5L17.7 13.5L22 14.1L18.8 17.1L19.6 21.4L16 19.3L12.4 21.4L13.2 17.1L10 14.1L14.3 13.5L16 9.5Z" fill="#0D0D0C"/>
        </svg>
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
  });
}

/**
 * Custom Center Radar Pin Icon (for Nearby GPS search center)
 */
function createCenterRadarIcon() {
  return L.divIcon({
    className: 'custom-center-radar-pin',
    html: `
      <div style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(34,197,94,0.3); display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;">
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #22C55E; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px rgba(34,197,94,0.9);"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

/**
 * High-performance CARTO Basemaps Leaflet integration.
 * Supports single place coordinates or discovery/nearby multi-place numbered markers.
 */
export function LeafletMap({
  lat = 9.0225,
  lng = 38.831,
  zoom = 14,
  radius = null,
  name = '',
  address = '',
  markers = [],
  selectedPlaceId = null,
  showCenterPin = true,
  onSelectMarker = null,
  draggableMarker = false,
  onLocationSelect = null,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markersMapRef = useRef(new Map());
  const pendingBoundsRef = useRef(null);
  const prevSelectedIdRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  // Validate coordinates
  const validCenterLat = !isNaN(parseFloat(lat)) ? parseFloat(lat) : 9.0225;
  const validCenterLng = !isNaN(parseFloat(lng)) ? parseFloat(lng) : 38.831;

  // Validate zoom level
  const validZoom = !isNaN(parseInt(zoom, 10))
    ? Math.max(1, Math.min(19, parseInt(zoom, 10)))
    : 14;

  // Filter valid place markers
  const validMarkers = (markers || []).filter(
    (m) =>
      m &&
      m.latitude !== null &&
      m.longitude !== null &&
      !isNaN(parseFloat(m.latitude)) &&
      !isNaN(parseFloat(m.longitude))
  );

  const hasCoordinates =
    validMarkers.length > 0 || (lat !== null && lng !== null && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)));

  // 1. Core Map and Markers initialization
  useEffect(() => {
    if (!mapContainerRef.current || !hasCoordinates) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [validCenterLat, validCenterLng],
          zoom: validZoom,
          zoomControl: true,
          attributionControl: true,
        });

        // Configure CARTO Voyager Basemap Tile Layer with Retina (@2x) support
        const cartoKey = import.meta.env.VITE_CARTO_API_KEY || '';
        const baseTileUrl =
          import.meta.env.VITE_CARTO_RASTER_URL ||
          'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        const tileUrl = cartoKey ? `${baseTileUrl}?key=${cartoKey}` : baseTileUrl;

        const tileLayer = L.tileLayer(tileUrl, {
          maxZoom: 19,
          subdomains: 'abcd',
          detectRetina: true,
          className: 'carto-voyager-tiles',
          attribution:
            '&copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
        });

        tileLayer.on('tileerror', (error) => {
          console.warn('CARTO tile loading issue:', error);
        });

        tileLayer.addTo(map);

        // Marker layer group
        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        // Ensure Leaflet resizes properly after initial mount and layout settlement
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ debounceMoveend: true });
          }
        }, 100);
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ debounceMoveend: true });
          }
        }, 350);
      }

      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;
      if (!map || !markersLayer) return;

      markersLayer.clearLayers();
      markersMapRef.current.clear();

      const isProximityMode = validMarkers.length > 0 || radius !== null;

      if (isProximityMode) {
        const bounds = L.latLngBounds([]);

        // 1. Draw radius circle around center location if radius is provided
        if (radius && !isNaN(parseFloat(radius)) && parseFloat(radius) > 0 && lat && lng) {
          const radiusMeters = parseFloat(radius) * 1000;
          const radiusCircle = L.circle([validCenterLat, validCenterLng], {
            radius: radiusMeters,
            color: '#22C55E',
            fillColor: '#22C55E',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '6, 8',
            interactive: false,
          });
          markersLayer.addLayer(radiusCircle);
          bounds.extend(radiusCircle.getBounds());
        }

        // 2. Render place markers with sequential rank numbers & overlapping displacement
        if (validMarkers.length > 0) {
          const displacedMarkers = getDisplacedCoordinates(validMarkers);

          displacedMarkers.forEach((item) => {
            const place = item.place;
            const rank = item.rank;
            const categoryLabel = getPlaceCategoryLabel(place);
            const isSelected = selectedPlaceId && String(selectedPlaceId) === String(place.id || place.slug);

            bounds.extend([item.lat, item.lng]);

            const normalIcon = createNumberedPlaceIcon({
              rank,
              categoryName: categoryLabel,
              isSelected: false,
              placeName: place.name,
            });

            const activeIcon = createNumberedPlaceIcon({
              rank,
              categoryName: categoryLabel,
              isSelected: true,
              placeName: place.name,
            });

            const marker = L.marker([item.lat, item.lng], {
              icon: isSelected ? activeIcon : normalIcon,
              title: place.name,
              zIndexOffset: isSelected ? 1000 : 0,
            });

            const rawRating = Number(place.average_rating);
            const hasRating = !isNaN(rawRating) && rawRating > 0;

            const popupContent = `
              <div class="custom-carto-popup" style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 2px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); font-size: 10px; font-weight: 700; color: #F5B301;">
                    #${rank} — ${escapeHtml(categoryLabel)}
                  </span>
                  ${
                    place.distance_km
                      ? `<span style="font-size: 10px; font-family: monospace; color: #22C55E; font-weight: 700;">${Number(place.distance_km).toFixed(1)} km</span>`
                      : ''
                  }
                </div>
                <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; line-height: 1.25; margin-bottom: 4px;">
                  ${escapeHtml(place.name)}
                </div>
                ${
                  place.address
                    ? `<div style="font-size: 11px; color: #AAA69C; margin-bottom: 8px; line-height: 1.3;">${escapeHtml(place.address)}</div>`
                    : ''
                }
                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 6px;">
                  ${
                    hasRating
                      ? `<div style="display: flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; color: #F5B301;">
                          <span>★</span>
                          <span>${rawRating.toFixed(1)}</span>
                          ${place.total_ratings > 0 ? `<span style="color: #AAA69C; font-weight: 400; font-size: 10px;">(${place.total_ratings})</span>` : ''}
                        </div>`
                      : `<span style="font-size: 10px; color: #AAA69C;">No reviews</span>`
                  }
                  ${
                    place.slug
                      ? `<a href="/places/${place.slug}" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 9999px; background: #FFFFFF; color: #000000; font-size: 11px; font-weight: 800; text-decoration: none; transition: opacity 0.2s;">
                          View Spot &rarr;
                        </a>`
                      : ''
                  }
                </div>
              </div>
            `;

            marker.bindPopup(popupContent);

            marker.on('click', () => {
              if (onSelectMarker) {
                onSelectMarker(place);
              }
            });

            markersLayer.addLayer(marker);

            const placeKey = String(place.id || place.slug);
            markersMapRef.current.set(placeKey, {
              marker,
              normalIcon,
              activeIcon,
              place,
            });
          });
        }

        // 3. Add search center pin if requested
        if (showCenterPin && lat && lng) {
          bounds.extend([validCenterLat, validCenterLng]);
          const centerMarker = L.marker([validCenterLat, validCenterLng], {
            icon: createCenterRadarIcon(),
            title: name || 'Search Center',
          });
          centerMarker.bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #F5F2EA;">
              <strong>${escapeHtml(name || 'Search Center')}</strong>
              ${address ? `<br/><span style="color: #AAA69C;">${escapeHtml(address)}</span>` : ''}
              ${radius ? `<br/><span style="color: #22C55E; font-family: monospace; font-size: 11px;">Search Radius: ${radius} km</span>` : ''}
            </div>
          `);
          markersLayer.addLayer(centerMarker);
        }

        // Fit map bounds safely (padding is [25, 25], total 50px required width and height)
        if (bounds.isValid()) {
          map.invalidateSize({ debounceMoveend: true });
          const containerSize = map.getSize();
          if (containerSize && containerSize.x > 50 && containerSize.y > 50) {
            map.fitBounds(bounds, { padding: [25, 25], maxZoom: 16 });
            pendingBoundsRef.current = null;
          } else {
            pendingBoundsRef.current = bounds;
            map.setView([validCenterLat, validCenterLng], validZoom);
          }
        } else {
          pendingBoundsRef.current = null;
          map.setView([validCenterLat, validCenterLng], validZoom);
        }
      } else {
        // Case B: Single place marker (e.g. PlaceLocation details view or interactive place creation picker)
        pendingBoundsRef.current = null;
        const isDraggable = Boolean(draggableMarker);
        const singleMarker = L.marker([validCenterLat, validCenterLng], {
          icon: createSinglePlaceIcon(false),
          title: name || 'Place Location',
          draggable: isDraggable,
        });

        if (isDraggable && onLocationSelect) {
          singleMarker.on('dragend', (event) => {
            const pos = event.target.getLatLng();
            onLocationSelect({
              lat: Number(pos.lat.toFixed(6)),
              lng: Number(pos.lng.toFixed(6)),
            });
          });
        }

        if (name || address || isDraggable) {
          singleMarker.bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif;">
              <strong style="color: #FFFFFF; font-size: 13px;">${escapeHtml(name || 'Selected Spot Location')}</strong>
              ${address ? `<br/><span style="color: #AAA69C; font-size: 11px;">${escapeHtml(address)}</span>` : ''}
              ${isDraggable ? '<br/><span style="color: #F5B301; font-size: 10px; font-weight: bold;">Drag pin or click map to adjust</span>' : ''}
            </div>
          `);
        }

        markersLayer.addLayer(singleMarker);
        map.setView([validCenterLat, validCenterLng], validZoom);

        if (isDraggable && onLocationSelect) {
          map.off('click');
          map.on('click', (e) => {
            singleMarker.setLatLng(e.latlng);
            onLocationSelect({
              lat: Number(e.latlng.lat.toFixed(6)),
              lng: Number(e.latlng.lng.toFixed(6)),
            });
          });
        }
      }
    } catch (err) {
      console.error('Failed to initialize CARTO Leaflet map', err);
      setMapError(true);
    }

    return () => {
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      }
      markersMapRef.current.clear();
    };
  }, [lat, lng, name, address, markers, validZoom, showCenterPin, onSelectMarker, draggableMarker, onLocationSelect, hasCoordinates, radius]);

  // 2. High-performance active marker icon & z-index synchronization (no map re-rendering or bounds fit on hover)
  useEffect(() => {
    const markersMap = markersMapRef.current;
    if (!markersMap || markersMap.size === 0) return;

    const currentSelectedId = selectedPlaceId ? String(selectedPlaceId) : null;
    const prevSelectedId = prevSelectedIdRef.current;

    if (currentSelectedId === prevSelectedId) return;
    prevSelectedIdRef.current = currentSelectedId;

    // Reset previously active marker
    if (prevSelectedId && markersMap.has(prevSelectedId)) {
      const prevEntry = markersMap.get(prevSelectedId);
      prevEntry.marker.setIcon(prevEntry.normalIcon);
      prevEntry.marker.setZIndexOffset(0);
    }

    // Elevate and highlight newly active marker
    if (currentSelectedId && markersMap.has(currentSelectedId)) {
      const currentEntry = markersMap.get(currentSelectedId);
      currentEntry.marker.setIcon(currentEntry.activeIcon);
      currentEntry.marker.setZIndexOffset(1000);
    }
  }, [selectedPlaceId]);

  // 3. ResizeObserver to handle layout shifts, container size changes, and deferred fitBounds
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    let rafId = null;

    const observer = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        map.invalidateSize({ debounceMoveend: true });

        if (pendingBoundsRef.current) {
          const size = map.getSize();
          if (size && size.x > 50 && size.y > 50) {
            const boundsToApply = pendingBoundsRef.current;
            pendingBoundsRef.current = null;
            map.fitBounds(boundsToApply, { padding: [25, 25], maxZoom: 16 });
          }
        }
      });
    });

    observer.observe(container);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Teardown map instance on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!hasCoordinates || mapError) {
    return (
      <div
        className={`w-full h-full min-h-[280px] sm:min-h-[340px] rounded-2xl overflow-hidden bg-[#16161A] border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-2 ${className}`}
      >
        <MapPin className="w-8 h-8 text-[#AAA69C]/60" />
        <p className="text-xs font-mono text-[#AAA69C]">
          {mapError ? 'Unable to load CARTO map layer' : 'Map coordinates unavailable for this spot'}
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Subtle contrast and saturation boost on CARTO Voyager tiles */
        .carto-voyager-tiles {
          filter: contrast(1.06) saturate(1.12);
        }
        /* Dark obsidian glass popups */
        .leaflet-popup-content-wrapper {
          background: #16161A !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 16px !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8) !important;
          color: #F5F2EA !important;
          padding: 8px !important;
        }
        .leaflet-popup-tip {
          background: #16161A !important;
          border-left: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #AAA69C !important;
          padding: 6px !important;
          font-size: 14px !important;
          top: 6px !important;
          right: 6px !important;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: #FFFFFF !important;
        }
        /* Yelp-style dark zoom controls */
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-bar a {
          background-color: #16161A !important;
          color: #F5F2EA !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          transition: all 0.2s ease !important;
        }
        .leaflet-bar a:hover {
          background-color: #24242A !important;
          color: #FFFFFF !important;
        }
        .leaflet-bar a:last-child {
          border-bottom: none !important;
        }
        .leaflet-control-attribution {
          background: rgba(13, 13, 12, 0.8) !important;
          color: #AAA69C !important;
          font-size: 10px !important;
          backdrop-filter: blur(4px);
          border-top-left-radius: 8px;
          padding: 2px 6px !important;
        }
        .leaflet-control-attribution a {
          color: #D1D0C9 !important;
        }
        .marker-selected {
          z-index: 1000 !important;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        className={`w-full h-full min-h-[280px] sm:min-h-[340px] rounded-2xl overflow-hidden bg-[#16161A] border border-white/10 relative z-10 shadow-lg ${className}`}
      />
    </>
  );
}

export default LeafletMap;
