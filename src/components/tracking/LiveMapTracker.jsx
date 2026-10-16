import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import MapLibreWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Navigation, Maximize2, Compass, Crosshair, MapPin } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { merchantService } from '../../services/merchantService';

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

export const LiveMapTracker = ({ order }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const merchantMarkerRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);

  const { isDark } = useTheme();
  const [is3D, setIs3D] = useState(true);
  const [userCoords, setUserCoords] = useState(null); // [lng, lat]
  const [isLiveGps, setIsLiveGps] = useState(false);
  const [riderProgress, setRiderProgress] = useState(0.65); // 65% en route

  // Check if order is at a stage where a rider is assigned
  const isRiderAssigned = ['Rider assigned', 'Picked up', 'On the way', 'Delivered'].includes(order?.orderStatus);

  // Default fallback: Bonifacio High Street, Taguig / Makati (14.5515, 121.0505)
  const DEFAULT_USER_LNG = 121.0505;
  const DEFAULT_USER_LAT = 14.5515;

  // 1. Get Live User Location via HTML5 Geolocation API
  useEffect(() => {
    let watchId = null;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lng, lat]);
          setIsLiveGps(true);
        },
        (err) => {
          console.warn('Geolocation warning/fallback:', err.message);
          setUserCoords([DEFAULT_USER_LNG, DEFAULT_USER_LAT]);
          setIsLiveGps(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
      );
    } else {
      setUserCoords([DEFAULT_USER_LNG, DEFAULT_USER_LAT]);
      setIsLiveGps(false);
    }

    return () => {
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // 2. Simulate live rider movement towards the user's location if order status is 'On the Way'
  useEffect(() => {
    const status = order?.orderStatus || 'On the Way';
    if (status === 'Delivered') {
      setRiderProgress(1.0);
      return;
    }
    if (status === 'Preparing' || status === 'Pending' || status === 'Confirmed' || status === 'Ready for pickup') {
      setRiderProgress(0.15);
      return;
    }

    const interval = setInterval(() => {
      setRiderProgress((prev) => {
        if (prev >= 0.95) return 0.95;
        return prev + 0.01;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.orderStatus]);

  const [merchantCoords, setMerchantCoords] = useState(null); // [lng, lat]
  const [merchantName, setMerchantName] = useState(order?.merchantName || 'Merchant');

  // Fetch real store coordinates & name set by merchant in Store Profile
  useEffect(() => {
    let isMounted = true;
    const fetchMerchantDetails = async () => {
      const merchId = order?.merchantId || order?.merchant?.id;
      if (merchId) {
        try {
          const merch = await merchantService.getMerchantById(merchId);
          if (isMounted && merch) {
            if (merch.name) {
              setMerchantName(merch.name);
            }
            if (merch.latitude !== undefined && merch.longitude !== undefined) {
              const lat = parseFloat(merch.latitude);
              const lng = parseFloat(merch.longitude);
              if (!isNaN(lat) && !isNaN(lng)) {
                setMerchantCoords([lng, lat]);
                return;
              }
            }
          }
        } catch (err) {
          console.warn('LiveMapTracker: Could not fetch merchant store coordinates:', err);
        }
      }

      if (order?.merchantLng && order?.merchantLat) {
        setMerchantCoords([parseFloat(order.merchantLng), parseFloat(order.merchantLat)]);
      }
      if (order?.merchantName) {
        setMerchantName(order.merchantName);
      }
    };

    fetchMerchantDetails();
    return () => { isMounted = false; };
  }, [order?.merchantId, order?.merchantName, order?.merchantLng, order?.merchantLat]);

  // Derived locations based on User Coords, Store Coords & Rider Progress
  const customerLng = userCoords ? userCoords[0] : DEFAULT_USER_LNG;
  const customerLat = userCoords ? userCoords[1] : DEFAULT_USER_LAT;

  // Use real store coordinates set by merchant in Store Profile, else fallback relative position
  const merchantLng = merchantCoords ? merchantCoords[0] : (customerLng - 0.022);
  const merchantLat = merchantCoords ? merchantCoords[1] : (customerLat - 0.016);

  // Rider position interpolated along route from merchant to customer
  const riderLng = merchantLng + (customerLng - merchantLng) * riderProgress;
  const riderLat = merchantLat + (customerLat - merchantLat) * riderProgress;

  // 3. Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyle = getMapStyle(isDark);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [(merchantLng + customerLng) / 2, (merchantLat + customerLat) / 2],
      zoom: 13.5,
      pitch: is3D ? 40 : 0,
      bearing: is3D ? -15 : 0,
      attributionControl: false,
      workerClass: MapLibreWorker
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      // Add GeoJSON Route
      const routeCoords = isRiderAssigned
        ? [[merchantLng, merchantLat], [riderLng, riderLat], [customerLng, customerLat]]
        : [[merchantLng, merchantLat], [customerLng, customerLat]];

      map.addSource('delivery-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoords
          }
        }
      });

      // Route line halo / glow
      map.addLayer({
        id: 'delivery-route-halo',
        type: 'line',
        source: 'delivery-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': isDark ? '#581c87' : '#e9d5ff',
          'line-width': 8,
          'line-opacity': 0.8
        }
      });

      // Route line dashed purple core
      map.addLayer({
        id: 'delivery-route-line',
        type: 'line',
        source: 'delivery-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#9333ea',
          'line-width': 5,
          'line-dasharray': [2, 2]
        }
      });

      // Fit bounds
      const bounds = new maplibregl.LngLatBounds()
        .extend([merchantLng, merchantLat])
        .extend([customerLng, customerLat]);

      if (isRiderAssigned) {
        bounds.extend([riderLng, riderLat]);
      }

      map.fitBounds(bounds, {
        padding: { top: 80, bottom: 60, left: 70, right: 70 },
        maxZoom: 15.5,
        duration: 1000
      });
    });

    // Create Custom HTML Markers
    // 1. Merchant Marker
    const merchantEl = document.createElement('div');
    merchantEl.className = 'flex flex-col items-center cursor-pointer group z-10';
    merchantEl.innerHTML = `
      <div class="p-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border-2 border-purple-500/80">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M14 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M6 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/></svg>
      </div>
      <span class="mt-1 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-md border border-slate-700 whitespace-nowrap">
        ${merchantName}
      </span>
    `;
    merchantMarkerRef.current = new maplibregl.Marker({ element: merchantEl, anchor: 'bottom' })
      .setLngLat([merchantLng, merchantLat])
      .addTo(map);

    // 2. Rider Marker (rendered only if rider is assigned)
    const riderEl = document.createElement('div');
    riderEl.className = 'flex flex-col items-center cursor-pointer z-30 transition-all duration-1000';
    if (!isRiderAssigned) {
      riderEl.style.display = 'none';
    }
    const riderFirstName = order?.rider?.name ? order.rider.name.split(' ')[0] : 'Rider';
    riderEl.innerHTML = `
      <div class="relative p-3 rounded-full bg-purple-600 text-white shadow-2xl ring-4 ring-purple-400/50 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
      </div>
      <span class="mt-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] font-extrabold shadow-xl border border-purple-400/50 whitespace-nowrap">
        ${riderFirstName} is on the way!
      </span>
    `;
    riderMarkerRef.current = new maplibregl.Marker({ element: riderEl, anchor: 'center' })
      .setLngLat([riderLng, riderLat])
      .addTo(map);

    // 3. Customer Live Location Marker
    const customerEl = document.createElement('div');
    customerEl.className = 'flex flex-col items-center cursor-pointer group z-20';
    customerEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></span>
        <div class="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-xl ring-4 ring-emerald-300 dark:ring-emerald-900/80">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
      <span class="mt-1 px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 text-[11px] font-extrabold shadow-lg backdrop-blur-md border border-emerald-600/50 whitespace-nowrap">
        Your Live Location
      </span>
    `;
    customerMarkerRef.current = new maplibregl.Marker({ element: customerEl, anchor: 'bottom' })
      .setLngLat([customerLng, customerLat])
      .addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  // Handle Theme changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(getMapStyle(isDark));
  }, [isDark]);

  // Handle position & route updates dynamically
  useEffect(() => {
    if (!mapRef.current) return;

    if (riderMarkerRef.current) {
      const el = riderMarkerRef.current.getElement();
      if (el) {
        el.style.display = isRiderAssigned ? 'flex' : 'none';
      }
      if (isRiderAssigned) {
        riderMarkerRef.current.setLngLat([riderLng, riderLat]);
      }
    }

    if (customerMarkerRef.current) {
      customerMarkerRef.current.setLngLat([customerLng, customerLat]);
    }
    if (merchantMarkerRef.current) {
      merchantMarkerRef.current.setLngLat([merchantLng, merchantLat]);
      const el = merchantMarkerRef.current.getElement();
      if (el) {
        const labelSpan = el.querySelector('span');
        if (labelSpan) {
          labelSpan.textContent = merchantName;
        }
      }
    }

    const routeSource = mapRef.current.getSource('delivery-route');
    if (routeSource) {
      const routeCoords = isRiderAssigned
        ? [[merchantLng, merchantLat], [riderLng, riderLat], [customerLng, customerLat]]
        : [[merchantLng, merchantLat], [customerLng, customerLat]];

      routeSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoords
        }
      });
    }
  }, [isRiderAssigned, riderLng, riderLat, customerLng, customerLat, merchantLng, merchantLat, merchantName]);

  // Auto-fit map camera bounds when real store coordinates are loaded
  useEffect(() => {
    if (!mapRef.current || !merchantCoords) return;
    const bounds = new maplibregl.LngLatBounds()
      .extend([merchantLng, merchantLat])
      .extend([customerLng, customerLat]);

    if (isRiderAssigned) {
      bounds.extend([riderLng, riderLat]);
    }

    mapRef.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 60, left: 70, right: 70 },
      maxZoom: 15.5,
      duration: 1200
    });
  }, [merchantCoords]);

  const handleFitBounds = () => {
    if (!mapRef.current) return;
    const bounds = new maplibregl.LngLatBounds()
      .extend([merchantLng, merchantLat])
      .extend([customerLng, customerLat]);

    if (isRiderAssigned) {
      bounds.extend([riderLng, riderLat]);
    }

    mapRef.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 60, left: 70, right: 70 },
      maxZoom: 15.5,
      duration: 800
    });
  };

  const handleRecenterUser = () => {
    if (!mapRef.current || !userCoords) return;
    mapRef.current.flyTo({
      center: userCoords,
      zoom: 15.5,
      pitch: is3D ? 45 : 0,
      duration: 1000
    });
  };

  const togglePerspective = () => {
    if (!mapRef.current) return;
    const next3D = !is3D;
    setIs3D(next3D);
    mapRef.current.easeTo({
      pitch: next3D ? 40 : 0,
      bearing: next3D ? -15 : 0,
      duration: 600
    });
  };

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-card bg-slate-900">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Floating ETA Banner Header */}
      <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto z-10">
        <div className="bg-white/95 dark:bg-[#121927]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Navigation size={18} className="animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">
                Estimated Delivery
              </span>
              {isLiveGps && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE GPS
                </span>
              )}
            </div>
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {order?.estimatedDeliveryTime || '12-18 mins'}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Map Control Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={handleRecenterUser}
          title="Center on My Live Location"
          className="p-2.5 bg-white/95 dark:bg-[#121927]/95 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 transition-all cursor-pointer active:scale-95"
        >
          <Crosshair size={16} />
        </button>
        <button
          onClick={handleFitBounds}
          title="Fit Route to View"
          className="p-2.5 bg-white/95 dark:bg-[#121927]/95 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 transition-all cursor-pointer active:scale-95"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={togglePerspective}
          title="Toggle 2D / 3D Perspective"
          className={`p-2.5 backdrop-blur-md rounded-2xl shadow-lg border transition-all cursor-pointer active:scale-95 ${
            is3D
              ? 'bg-purple-600 text-white border-purple-500'
              : 'bg-white/95 dark:bg-[#121927]/95 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-800'
          }`}
        >
          <Compass size={16} className={is3D ? 'rotate-45 transition-transform' : ''} />
        </button>
      </div>

      {/* Footer attribution badge */}
      <div className="absolute bottom-2 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-900/80 text-slate-300 text-[10px] font-semibold backdrop-blur-md border border-slate-700/50 pointer-events-none flex items-center gap-1.5">
        <MapPin size={10} className="text-purple-400" />
        MapLibre GL • CARTO / OpenStreetMap
      </div>
    </div>
  );
};
