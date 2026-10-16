import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import MapLibreWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, Search, Loader2, Compass, CheckCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

// Function to construct clean, watermark-free OpenStreetMap style
const getMapStyle = (isDark) => {
  const osmTiles = [
    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
  ];

  return {
    version: 8,
    sources: {
      'map-tiles': {
        type: 'raster',
        tiles: osmTiles,
        tileSize: 256,
        maxzoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'map-tiles-layer',
        type: 'raster',
        source: 'map-tiles',
        minzoom: 0,
        maxzoom: 19,
        paint: isDark ? {
          'raster-brightness-min': 0.05,
          'raster-brightness-max': 0.6,
          'raster-saturation': -0.7,
          'raster-contrast': 0.25
        } : {}
      }
    ]
  };
};

// Default fallback coordinates: Manila / Taguig (14.5515, 121.0505)
const DEFAULT_LAT = 14.5515;
const DEFAULT_LNG = 121.0505;

export const MapLocationPicker = ({
  latitude = DEFAULT_LAT,
  longitude = DEFAULT_LNG,
  address = '',
  city = '',
  onChange,
  height = '320px',
  label = 'Select Store Location on Map'
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const { isDark } = useTheme();

  const currentLat = parseFloat(latitude) || DEFAULT_LAT;
  const currentLng = parseFloat(longitude) || DEFAULT_LNG;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusText, setStatusText] = useState('Click or drag pin on map to set exact store location');

  // Reverse geocode helper
  const handlePositionChange = async (lat, lng, flyTo = false) => {
    if (flyTo && mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 });
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }

    setIsGeocoding(true);
    setStatusText('Fetching address details for selected pin location...');

    let resolvedAddress = address;
    let resolvedCity = city;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const a = data.address || {};
        const roadName = a.road || a.pedestrian || a.footway || a.street || a.suburb || a.neighbourhood || '';
        const houseNum = a.house_number ? `${a.house_number} ` : '';

        if (roadName) {
          resolvedAddress = `${houseNum}${roadName}`;
        } else if (data.display_name) {
          resolvedAddress = data.display_name.split(',')[0];
        }

        resolvedCity = a.city || a.town || a.municipality || a.county || a.state_district || 'Metro Manila';
        setStatusText(`Location set: ${resolvedAddress}, ${resolvedCity}`);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setStatusText('Location coordinates updated.');
    } finally {
      setIsGeocoding(false);
    }

    if (onChange) {
      onChange({
        latitude: lat,
        longitude: lng,
        address: resolvedAddress || address || 'Pin Location',
        city: resolvedCity || city || 'Metro Manila'
      });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyle = getMapStyle(isDark);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [currentLng, currentLat],
      zoom: 14,
      attributionControl: false,
      workerClass: MapLibreWorker
    });

    mapRef.current = map;

    // Navigation Controls
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    // Create Custom Pin Element
    const el = document.createElement('div');
    el.className = 'custom-map-picker-pin';
    el.style.width = '36px';
    el.style.height = '36px';
    el.style.cursor = 'grab';
    el.style.backgroundImage = 'radial-gradient(circle, #ffb100 0%, #d97706 100%)';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid #ffffff';
    el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.35)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.innerHTML = '<span style="font-size:18px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));">📍</span>';

    // Create Marker
    const marker = new maplibregl.Marker({
      element: el,
      draggable: true
    })
      .setLngLat([currentLng, currentLat])
      .addTo(map);

    markerRef.current = marker;

    // Marker Drag Handler
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      handlePositionChange(lngLat.lat, lngLat.lng, false);
    });

    // Map Click Handler
    map.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      marker.setLngLat([lng, lat]);
      handlePositionChange(lat, lng, false);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map style on dark mode change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(getMapStyle(isDark));
    }
  }, [isDark]);

  // Handle GPS location click
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setStatusText('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setStatusText('Locating device via GPS...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        handlePositionChange(lat, lng, true);
      },
      (err) => {
        setIsLocating(false);
        setStatusText('Could not get GPS location. Please choose on the map.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle Place Search
  const handleSearchSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=ph`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results);
        if (results.length === 0) {
          setStatusText(`No location results found for "${searchQuery}"`);
        }
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    setSearchResults([]);
    setSearchQuery('');
    handlePositionChange(lat, lng, true);
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
          {label}
        </label>

        <button
          type="button"
          onClick={handleUseGps}
          disabled={isLocating}
          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          {isLocating ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
          <span>{isLocating ? 'Detecting GPS...' : 'Use My Current GPS Location'}</span>
        </button>
      </div>

      {/* Location Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearchSubmit(e);
                }
              }}
              placeholder="Search street name, landmark, or city (e.g. BGC Taguig, Greenhills)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
            />
          </div>
          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={isSearching || !searchQuery.trim()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Search Location'}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
            {searchResults.map((res, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-2"
              >
                <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="truncate">
                  <div className="font-bold text-slate-900 dark:text-white truncate">{res.display_name}</div>
                  <div className="text-[10px] text-slate-400">Lat: {parseFloat(res.lat).toFixed(4)}, Lng: {parseFloat(res.lon).toFixed(4)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner group">
        <div ref={mapContainerRef} style={{ width: '100%', height }} className="bg-slate-900" />

        {/* Map Status Overlay Bar */}
        <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold flex items-center justify-between gap-2 shadow-md border border-white/10">
          <div className="flex items-center gap-1.5 truncate">
            {isGeocoding ? (
              <Loader2 size={13} className="animate-spin text-amber-400 shrink-0" />
            ) : (
              <MapPin size={13} className="text-amber-400 shrink-0" />
            )}
            <span className="truncate">{statusText}</span>
          </div>

          <div className="text-[10px] font-mono text-slate-400 shrink-0 hidden sm:block">
            {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
};
