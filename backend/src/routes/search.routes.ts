import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// All search routes require authentication
router.use(authenticateToken);

// POST /api/search/loads - Advanced search for loads
router.post('/loads', asyncHandler(searchController.searchLoads.bind(searchController)));

// GET /api/search/loads - Also support GET for backward compatibility
router.get('/loads', asyncHandler(searchController.searchLoads.bind(searchController)));

// GET /api/search/autocomplete - Autocomplete suggestions
router.get('/autocomplete', asyncHandler(searchController.autocomplete.bind(searchController)));

// GET /api/search/popular - Popular searches
router.get('/popular', asyncHandler(searchController.getPopularSearches.bind(searchController)));

// GET /api/search/recent - Recent searches for user
router.get('/recent', asyncHandler(searchController.getRecentSearches.bind(searchController)));

// GET /api/search/suggestions - Search suggestions
router.get('/suggestions', asyncHandler(searchController.getSuggestions.bind(searchController)));

export default router;

