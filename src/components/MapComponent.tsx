/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LocationCoordinates } from '../types';
import { reverseGeocode } from '../utils/geocoding';
import { MapPin, Navigation, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

interface MapComponentProps {
  coordinates: LocationCoordinates;
  onChangeCoordinates: (coords: LocationCoordinates) => void;
  address: string;
  onChangeAddress: (address: string) => void;
  isCustomLocation: boolean;
  setIsCustomLocation: (isCustom: boolean) => void;
}

export function MapComponent({
  coordinates,
  onChangeCoordinates,
  address,
  onChangeAddress,
  isCustomLocation,
  setIsCustomLocation,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);

  const [mapsApiState, setMapsApiState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [mapsErrorMsg, setMapsErrorMsg] = useState<string | null>(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Default key placeholder
  const apiKey = ((import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // 1. Resolve Address Helper
  const triggerReverseGeocoding = useCallback((coords: LocationCoordinates) => {
    setGeocodingLoading(true);
    reverseGeocode(coords, (resolved, err) => {
      setGeocodingLoading(false);
      if (!err) {
        onChangeAddress(resolved);
      }
    });
  }, [onChangeAddress]);

  // 2. Initialize Real Google Map if API is available
  useEffect(() => {
    if (!apiKey) {
      setMapsApiState('failed');
      setMapsErrorMsg('No Google Maps API key provided. Using Local Vector Grid Simulator.');
      return;
    }

    setMapsApiState('loading');
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    (loader as any)
      .load()
      .then((google) => {
        if (!mapRef.current) return;

        setMapsApiState('loaded');

        // Create map
        const mapOptions: google.maps.MapOptions = {
          center: { lat: coordinates.lat, lng: coordinates.lng },
          zoom: 16,
          mapId: 'citylens_civic_map',
          disableDefaultUI: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        };

        const map = new google.maps.Map(mapRef.current, mapOptions);
        googleMapInstanceRef.current = map;

        // Create Draggable Marker
        const marker = new google.maps.Marker({
          position: { lat: coordinates.lat, lng: coordinates.lng },
          map: map,
          draggable: true,
          title: 'Drag to adjust incident location',
          animation: google.maps.Animation.DROP,
        });
        markerInstanceRef.current = marker;

        // Register drag events
        marker.addListener('dragend', () => {
          const position = marker.getPosition();
          if (position) {
            const newCoords: LocationCoordinates = {
              lat: position.lat(),
              lng: position.lng(),
            };
            onChangeCoordinates(newCoords);
            setIsCustomLocation(true);
            triggerReverseGeocoding(newCoords);
          }
        });

        // Map Click Event
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const newCoords: LocationCoordinates = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            };
            onChangeCoordinates(newCoords);
            setIsCustomLocation(true);
            marker.setPosition(e.latLng);
            triggerReverseGeocoding(newCoords);
          }
        });
      })
      .catch((err) => {
        console.error('Google Maps Load Error:', err);
        setMapsApiState('failed');
        setMapsErrorMsg('Failed to load Google Maps JS SDK. Falling back to Grid Simulator.');
      });

    return () => {
      // Cleanup map events if needed
      if (googleMapInstanceRef.current) {
        google.maps.event.clearInstanceListeners(googleMapInstanceRef.current);
      }
    };
  }, [apiKey]);

  // 3. Keep Marker & Map Centered when Coordinates Change Externally
  useEffect(() => {
    if (mapsApiState === 'loaded' && googleMapInstanceRef.current && markerInstanceRef.current) {
      const latLng = { lat: coordinates.lat, lng: coordinates.lng };
      googleMapInstanceRef.current.setCenter(latLng);
      markerInstanceRef.current.setPosition(latLng);
    }
  }, [coordinates.lat, coordinates.lng, mapsApiState]);

  // 4. ResizeObserver for Map Container to prevent collapse or canvas breaks
  useEffect(() => {
    if (mapRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (googleMapInstanceRef.current) {
          // Trigger Google Maps resize event
          if (typeof window !== 'undefined' && window.google) {
            google.maps.event.trigger(googleMapInstanceRef.current, 'resize');
          }
        }
      });
      resizeObserverRef.current.observe(mapRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [mapsApiState]);

  // 5. Geolocation Detection triggers
  const handleDetectGPS = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.geolocation) {
      setGeocodingLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          onChangeCoordinates(newCoords);
          setIsCustomLocation(false);
          triggerReverseGeocoding(newCoords);
        },
        (err) => {
          console.error(err);
          setGeocodingLoading(false);
          alert('GPS permission denied or signal unavailable. Please drag the pin on the simulator grid.');
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Mock Grid Interaction Handler (for Fallback Mode)
  const handleFallbackGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mapsApiState !== 'failed') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Map pixel click into delta offsets from the current coords or a default starting point
    const xFrac = (x / rect.width - 0.5) * 0.01;
    const yFrac = -(y / rect.height - 0.5) * 0.01;

    const newCoords: LocationCoordinates = {
      lat: +(coordinates.lat + yFrac).toFixed(6),
      lng: +(coordinates.lng + xFrac).toFixed(6),
    };

    onChangeCoordinates(newCoords);
    setIsCustomLocation(true);
    triggerReverseGeocoding(newCoords);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[380px]">
      {/* Map Header Controls */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3 shrink-0">
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Spatial Verification & Infrastructure Map
          </h2>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {isCustomLocation ? '📍 Manual verified pin location' : '📡 Auto-detected GPS location'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDetectGPS}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors flex items-center gap-1"
          >
            <Navigation className="w-3 h-3 text-indigo-500" />
            RE-DETECT GPS
          </button>
        </div>
      </div>

      {/* Map Display & Error Fallback Container */}
      <div className="flex-1 relative bg-slate-100 min-h-[220px]">
        {mapsApiState === 'loading' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 gap-2">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-500">Loading Google Maps API...</p>
          </div>
        )}

        {/* Real Map Target Ref */}
        <div
          ref={mapRef}
          className={`w-full h-full min-h-[220px] ${mapsApiState === 'loaded' ? 'block' : 'hidden'}`}
        />

        {/* Fallback Smart Simulator Canvas Grid */}
        {mapsApiState === 'failed' && (
          <div
            onClick={handleFallbackGridClick}
            className="absolute inset-0 w-full h-full bg-slate-900 cursor-crosshair overflow-hidden flex flex-col justify-between"
            style={{
              backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Warning Info overlay */}
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 m-2 rounded-lg flex items-center gap-3 backdrop-blur-sm shadow-lg pointer-events-none z-10">
              <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/30 text-indigo-400">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider leading-none">
                  INTERACTIVE VECTOR GRID SIMULATOR ACTIVE
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">
                  Maps API key is missing. <strong>Click anywhere inside the grid</strong> to simulate dragging the incident pin.
                </p>
              </div>
            </div>

            {/* Simulated Marker Pin (Center of Grid) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="relative flex flex-col items-center">
                {/* Simulated Halo Ripples */}
                <div className="w-12 h-12 bg-indigo-500 rounded-full animate-ping opacity-15 absolute -top-2"></div>
                <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse opacity-25 absolute -top-0"></div>

                <MapPin className="w-8 h-8 text-indigo-400 fill-indigo-600/40 relative z-10 filter drop-shadow-md" />
                <div className="bg-slate-950 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md mt-1 border border-slate-800 tracking-wider">
                  {coordinates.lat.toFixed(5)}°, {coordinates.lng.toFixed(5)}°
                </div>
              </div>
            </div>

            {/* Decorative Vector Assets Grid Overlay */}
            <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur p-3 rounded-xl border border-slate-800 shadow-2xl w-52 pointer-events-none">
              <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 leading-none">
                SIMULATED NEARBY ASSETS
              </p>
              <div className="space-y-2 font-mono">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                    <span className="text-slate-300 font-bold">Storm Drain #A-22</span>
                  </div>
                  <span className="text-slate-500">12m West</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    <span className="text-slate-300 font-bold">Streetlight #L-091</span>
                  </div>
                  <span className="text-slate-500">45m North</span>
                </div>
              </div>
            </div>

            {/* Instruction Footer Overlay */}
            <div className="p-2 text-right text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest bg-slate-950/50">
              Interactive Grid Coordinates • Click to verify incident
            </div>
          </div>
        )}
      </div>

      {/* Map Resolved Address Tray */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Resolved Incident Address</p>
            {geocodingLoading ? (
              <div className="flex items-center gap-1.5 mt-1">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin shrink-0" />
                <span className="text-xs text-slate-500 italic">Reverse geocoding coordinates...</span>
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-800 leading-normal mt-0.5 truncate" title={address}>
                {address || 'No address resolved. Verify location on the map.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
