import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, AlertCircle } from 'lucide-react';

/**
 * High-performance CARTO Basemaps Leaflet integration.
 * Supports single place coordinates or discovery/nearby multi-place markers.
 */
export function LeafletMap({
  lat = 9.0225,
  lng = 38.831,
  zoom = 14,
  radius = null,
  name = '',
  address = '',
  markers = [],
  showCenterPin = true,
  onSelectMarker = null,
  draggableMarker = false,
  onLocationSelect = null,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  // Validate coordinates
  const validCenterLat = !isNaN(parseFloat(lat)) ? parseFloat(lat) : 9.0225;
  const validCenterLng = !isNaN(parseFloat(lng)) ? parseFloat(lng) : 38.831;

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

  useEffect(() => {
    if (!mapContainerRef.current || !hasCoordinates) return;

    try {
      // 1. Initialize Leaflet Map if not already created
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [validCenterLat, validCenterLng],
          zoom: zoom,
          zoomControl: true,
          attributionControl: true,
        });

        // 2. Configure CARTO Voyager Basemap Tile Layer using API Key
        const cartoKey = import.meta.env.VITE_CARTO_API_KEY || '';
        const baseTileUrl =
          import.meta.env.VITE_CARTO_RASTER_URL ||
          'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

        const tileUrl = cartoKey ? `${baseTileUrl}?key=${cartoKey}` : baseTileUrl;

        const tileLayer = L.tileLayer(tileUrl, {
          maxZoom: 19,
          subdomains: 'abcd',
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

        // Invalidate size after DOM mount
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      }

      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;
      if (!map || !markersLayer) return;

      markersLayer.clearLayers();

      // Custom Star Pin Icon for Local Places
      const createPlaceIcon = (rank = null) =>
        L.divIcon({
          className: 'custom-carto-star-pin',
          html: `
            <div style="transform: translate(-50%, -100%); cursor: pointer; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
              <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.16 0 0 7.16 0 16C0 26.5 16 42 16 42C16 42 32 26.5 32 16C32 7.16 24.84 0 16 0Z" fill="#16161A" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="16" cy="16" r="10" fill="#F5B301"/>
                <path d="M16 9.5L17.7 13.5L22 14.1L18.8 17.1L19.6 21.4L16 19.3L12.4 21.4L13.2 17.1L10 14.1L14.3 13.5L16 9.5Z" fill="#0D0D0C"/>
              </svg>
            </div>
          `,
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -40],
        });

      // Custom Center Radar Pin Icon (for Nearby/GPS search center)
      const createCenterIcon = () =>
        L.divIcon({
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

        // 2. Render place markers if provided
        if (validMarkers.length > 0) {
          validMarkers.forEach((place) => {
            const pLat = parseFloat(place.latitude);
            const pLng = parseFloat(place.longitude);
            bounds.extend([pLat, pLng]);

            const marker = L.marker([pLat, pLng], {
              icon: createPlaceIcon(),
              title: place.name,
            });

            const popupContent = `
              <div style="font-family: Inter, sans-serif; min-width: 170px;">
                <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-bottom: 2px;">
                  ${place.name}
                </div>
                ${
                  place.address
                    ? `<div style="font-size: 11px; color: #AAA69C; margin-bottom: 4px;">${place.address}</div>`
                    : ''
                }
                ${
                  place.distance_km
                    ? `<div style="font-size: 10px; font-family: monospace; color: #22C55E; margin-bottom: 6px;">${Number(place.distance_km).toFixed(1)} km away</div>`
                    : ''
                }
                ${
                  place.slug
                    ? `<a href="/places/${place.slug}" class="carto-popup-btn">View Spot &rarr;</a>`
                    : ''
                }
              </div>
            `;

            marker.bindPopup(popupContent);

            if (onSelectMarker) {
              marker.on('click', () => onSelectMarker(place));
            }

            markersLayer.addLayer(marker);
          });
        }

        // 3. Add search center pin if requested
        if (showCenterPin && lat && lng) {
          bounds.extend([validCenterLat, validCenterLng]);
          const centerMarker = L.marker([validCenterLat, validCenterLng], {
            icon: createCenterIcon(),
            title: name || 'Search Center',
          });
          centerMarker.bindPopup(`
            <div style="font-family: Inter, sans-serif; font-size: 12px; color: #F5F2EA;">
              <strong>${name || 'Search Center'}</strong>
              ${address ? `<br/><span style="color: #AAA69C;">${address}</span>` : ''}
              ${radius ? `<br/><span style="color: #22C55E; font-family: monospace; font-size: 11px;">Search Radius: ${radius} km</span>` : ''}
            </div>
          `);
          markersLayer.addLayer(centerMarker);
        }

        // Fit map bounds to encompass all valid elements (circle, place markers, and center pin)
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [25, 25], maxZoom: 16 });
        } else {
          map.setView([validCenterLat, validCenterLng], zoom);
        }
      } else {
        // Case B: Single place marker (e.g. PlaceLocation details view or interactive place creation picker)
        const isDraggable = Boolean(draggableMarker);
        const singleMarker = L.marker([validCenterLat, validCenterLng], {
          icon: createPlaceIcon(),
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
            <div style="font-family: Inter, sans-serif;">
              <strong style="color: #FFFFFF; font-size: 13px;">${name || 'Selected Spot Location'}</strong>
              ${address ? `<br/><span style="color: #AAA69C; font-size: 11px;">${address}</span>` : ''}
              ${isDraggable ? '<br/><span style="color: #F5B301; font-size: 10px; font-weight: bold;">Drag pin or click map to adjust</span>' : ''}
            </div>
          `);
        }

        markersLayer.addLayer(singleMarker);
        map.setView([validCenterLat, validCenterLng], zoom);

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
      // Clean up markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      }
    };
  }, [lat, lng, name, address, markers, zoom, showCenterPin, onSelectMarker, draggableMarker, onLocationSelect, hasCoordinates, radius]);

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
        className={`w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-[#16161A] border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-2 ${className}`}
      >
        <MapPin className="w-8 h-8 text-[#AAA69C]/60" />
        <p className="text-xs font-mono text-[#AAA69C]">
          {mapError ? 'Unable to load CARTO map layer' : 'Map coordinates unavailable for this spot'}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden bg-[#16161A] border border-white/10 relative z-10 shadow-lg ${className}`}
    />
  );
}

export default LeafletMap;
