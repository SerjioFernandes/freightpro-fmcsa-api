import { Router } from 'express';
import { locationController } from '../controllers/location.controller.js';

const router = Router();

/**
 * @route   GET /api/locations/geocode
 * @desc    Convert address to coordinates
 * @access  Public
 */
router.get('/geocode', locationController.geocode.bind(locationController));

/**
 * @route   GET /api/locations/reverse
 * @desc    Convert coordinates to address
 * @access  Public
 */
router.get('/reverse', locationController.reverseGeocode.bind(locationController));

/**
 * @route   POST /api/locations/distance
 * @desc    Calculate distance between two points
 * @access  Public
 */
router.post('/distance', locationController.calculateDistance.bind(locationController));

export default router;

