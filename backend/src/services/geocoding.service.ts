import NodeGeocoder from 'node-geocoder';
import { logger } from '../utils/logger.js';

interface GeoPoint {
  latitude: number;
  longitude: number;
}

interface Address {
  city: string;
  state: string;
  zip: string;
  country?: string;
}

class GeocodingService {
  private geocoder: NodeGeocoder.Geocoder | null = null;

  constructor() {
    try {
      // Initialize with OpenStreetMap (free, no API key required)
      this.geocoder = NodeGeocoder({
        provider: 'openstreetmap',
        formatter: null, // Use default formatter
      });
      logger.info('Geocoding service initialized');
    } catch (error: any) {
      logger.error('Failed to initialize geocoding service', { error: error.message });
    }
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: Address): Promise<GeoPoint | null> {
    if (!this.geocoder) {
      logger.warn('Geocoding service not initialized');
      return null;
    }

    try {
      const query = `${address.city}, ${address.state} ${address.zip}, ${address.country || 'USA'}`;
      const results = await this.geocoder.geocode(query);

      if (results && results.length > 0) {
        return {
          latitude: results[0].latitude || 0,
          longitude: results[0].longitude || 0,
        };
      }

      logger.warn('No geocoding results found', { query });
      return null;
    } catch (error: any) {
      logger.error('Geocoding failed', { error: error.message, address });
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<Address | null> {
    if (!this.geocoder) {
      logger.warn('Geocoding service not initialized');
      return null;
    }

    try {
      const results = await this.geocoder.reverse({ lat: latitude, lon: longitude });

      if (results && results.length > 0) {
        const result = results[0];
        return {
          city: result.city || '',
          state: result.administrativeLevels?.level1short || '',
          zip: result.zipcode || '',
          country: result.countryCode || 'US',
        };
      }

      logger.warn('No reverse geocoding results found', { latitude, longitude });
      return null;
    } catch (error: any) {
      logger.error('Reverse geocoding failed', { error: error.message, latitude, longitude });
      return null;
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * Returns distance in miles
   */
  calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearby loads within radius
   */
  async findNearbyLoads(
    location: GeoPoint,
    loads: Array<{ origin: Address; destination: Address; [key: string]: unknown }>,
    radiusMiles: number
  ): Promise<Array<{ load: { origin: Address; destination: Address; [key: string]: unknown }; distance: number }>> {
    const nearby: Array<{ load: { origin: Address; destination: Address; [key: string]: unknown }; distance: number }> = [];

    for (const load of loads) {
      // Calculate distance from user location to load origin
      const originCoords = await this.geocodeAddress(load.origin);
      if (originCoords) {
        const distance = this.calculateDistance(location, originCoords);
        if (distance <= radiusMiles) {
          nearby.push({ load, distance });
        }
      }
    }

    // Sort by distance
    nearby.sort((a, b) => a.distance - b.distance);

    return nearby;
  }
}

export const geocodingService = new GeocodingService();

