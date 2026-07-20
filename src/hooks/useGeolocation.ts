/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { LocationCoordinates } from '../types';

interface GeolocationState {
  coordinates: LocationCoordinates | null;
  loading: boolean;
  error: string | null;
  permissionStatus: PermissionState | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
    permissionStatus: null,
  });

  const detectLocation = useCallback((onSuccess?: (coords: LocationCoordinates) => void) => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Standard high accuracy geolocation request
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: LocationCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setState({
          coordinates: coords,
          loading: false,
          error: null,
          permissionStatus: 'granted',
        });
        if (onSuccess) {
          onSuccess(coords);
        }
      },
      (error) => {
        let errorMsg = 'Failed to retrieve your location.';
        let perm: PermissionState = 'prompt';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'GPS permission denied. Please enable location services or drag the pin manually.';
            perm = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'GPS signal unavailable. Please retry or enter position manually.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out. Retrying or manual selection is recommended.';
            break;
        }

        setState({
          coordinates: null,
          loading: false,
          error: errorMsg,
          permissionStatus: perm,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    ...state,
    detectLocation,
    setCoordinates: useCallback((coords: LocationCoordinates) => {
      setState((prev) => ({
        ...prev,
        coordinates: coords,
        loading: false,
        error: null,
      }));
    }, []),
  };
}
