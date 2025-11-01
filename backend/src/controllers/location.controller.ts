import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { geocodingService } from '../services/geocoding.service.js';
import { logger } from '../utils/logger.js';

export class LocationController {
  /**
   * Geocode address to coordinates
   * GET /api/locations/geocode?city=Chicago&state=IL&zip=60601&country=US
   */
  async geocode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { city, state, zip, country } = req.query;

      if (!city || !state || !zip) {
        res.status(400).json({ error: 'City, state, and zip are required' });
        return;
      }

      const coordinates = await geocodingService.geocodeAddress({
        city: city as string,
        state: state as string,
        zip: zip as string,
        country: (country as string) || 'US'
      });

      if (!coordinates) {
        res.status(404).json({ error: 'Address not found' });
        return;
      }

      res.json({
        success: true,
        data: coordinates
      });
    } catch (error: any) {
      logger.error('Geocoding failed', { error: error.message });
      res.status(500).json({ error: 'Failed to geocode address' });
    }
  }

  /**
   * Reverse geocode coordinates to address
   * GET /api/locations/reverse?lat=41.8781&lng=-87.6298
   */
  async reverseGeocode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        res.status(400).json({ error: 'Latitude and longitude are required' });
        return;
      }

      const address = await geocodingService.reverseGeocode(
        parseFloat(lat as string),
        parseFloat(lng as string)
      );

      if (!address) {
        res.status(404).json({ error: 'Address not found for coordinates' });
        return;
      }

      res.json({
        success: true,
        data: address
      });
    } catch (error: any) {
      logger.error('Reverse geocoding failed', { error: error.message });
      res.status(500).json({ error: 'Failed to reverse geocode coordinates' });
    }
  }

  /**
   * Calculate distance between two points
   * POST /api/locations/distance
   * Body: { point1: { lat, lng }, point2: { lat, lng } }
   */
  async calculateDistance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { point1, point2 } = req.body;

      if (!point1 || !point2 || !point1.lat || !point1.lng || !point2.lat || !point2.lng) {
        res.status(400).json({ error: 'Both points with lat/lng are required' });
        return;
      }

      const distance = geocodingService.calculateDistance(
        { latitude: point1.lat, longitude: point1.lng },
        { latitude: point2.lat, longitude: point2.lng }
      );

      res.json({
        success: true,
        data: { distance, unit: 'miles' }
      });
    } catch (error: any) {
      logger.error('Distance calculation failed', { error: error.message });
      res.status(500).json({ error: 'Failed to calculate distance' });
    }
  }
}

export const locationController = new LocationController();

