import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { savedSearchController } from '../controllers/savedSearch.controller.js';

const router = Router();

/**
 * @route   GET /api/searches
 * @desc    Get all saved searches for current user
 * @access  Private
 */
router.get('/', authenticateToken, savedSearchController.getSearches.bind(savedSearchController));

/**
 * @route   POST /api/searches
 * @desc    Create a new saved search
 * @access  Private
 */
router.post('/', authenticateToken, savedSearchController.createSearch.bind(savedSearchController));

/**
 * @route   PUT /api/searches/:id
 * @desc    Update a saved search
 * @access  Private
 */
router.put('/:id', authenticateToken, savedSearchController.updateSearch.bind(savedSearchController));

/**
 * @route   PUT /api/searches/:id/alert
 * @desc    Toggle alert for a saved search
 * @access  Private
 */
router.put('/:id/alert', authenticateToken, savedSearchController.toggleAlert.bind(savedSearchController));

/**
 * @route   DELETE /api/searches/:id
 * @desc    Delete a saved search
 * @access  Private
 */
router.delete('/:id', authenticateToken, savedSearchController.deleteSearch.bind(savedSearchController));

export default router;

