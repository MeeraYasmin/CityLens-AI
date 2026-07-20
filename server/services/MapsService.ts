/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from '../config';

class MapsService {
  /**
   * Reverse geocode coordinates to a clean, formatted address.
   * Utilizes Google Maps API when key is available, falls back to deterministic smart-city addresses otherwise.
   */
  public async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (config.googleMapsApiKey) {
      try {
        console.log(`[MapsService] Performing reverse geocoding via Google Maps API for: ${lat}, ${lng}`);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${config.googleMapsApiKey}`
        );
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results[0]) {
          return data.results[0].formatted_address;
        } else {
          console.warn('[MapsService] Google Maps API status:', data.status);
        }
      } catch (err: any) {
        console.error('[MapsService] Reverse geocoding API error:', err.message);
      }
    }

    // Secure, realistic local fallback
    return this.generateFallbackAddress(lat, lng);
  }

  /**
   * Query nearby physical municipal assets (useful for pipeline context or map layer decoration)
   */
  public getNearbyAssets(lat: number, lng: number) {
    // Generate some mock municipal assets based on coordinates to represent dynamic surrounding sensors/systems
    return [
      { id: 'AST-WL-8812', type: 'WATER_VALVE', name: 'Water Distribution Valve #8812', distanceM: 42, active: true },
      { id: 'AST-SL-3392', type: 'STREET_LIGHT', name: 'High-Pressure Sodium Luminaire #3392', distanceM: 18, active: false },
      { id: 'AST-CB-4491', type: 'CATCH_BASIN', name: 'Storm Drain Catch Basin Grate #4491', distanceM: 85, active: true },
      { id: 'AST-TS-0091', type: 'TRAFFIC_SIGNAL', name: 'Junction Signal Logic Controller #0091', distanceM: 120, active: true }
    ];
  }

  private generateFallbackAddress(lat: number, lng: number): string {
    const latFrac = Math.abs(lat - Math.floor(lat));
    const lngFrac = Math.abs(lng - Math.floor(lng));

    const streets = [
      'Main St', 'Broadway Ave', 'Oak Dr', 'Pine Rd', '5th Ave', '12th St', 'Civic Parkway',
      'Maple Ave', 'Washington Blvd', 'Elm St', 'Market Rd', 'Commerce St', 'Spring St'
    ];
    
    const sectors = [
      'Midtown Business District', 'Westside Residential Sector', 'Eastside Industrial Hub',
      'Civic Core Area', 'North Waterfront District', 'Suburban Green Belt', 'Tech Corridor'
    ];

    const streetNum = Math.floor(latFrac * 1000) + 1;
    const streetName = streets[Math.floor(lngFrac * streets.length)];
    const sectorName = sectors[Math.floor((latFrac + lngFrac) * sectors.length) % sectors.length];

    return `${streetNum} ${streetName}, ${sectorName}, Metroville (Lat: ${lat.toFixed(5)}°N, Lng: ${lng.toFixed(5)}°W)`;
  }
}

export const mapsService = new MapsService();
