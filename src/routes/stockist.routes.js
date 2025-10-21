const express = require('express');
const { validateBody, validateQuery } = require('../shared/validate');
const { 
	createStockistSchema, 
	updateStockistSchema,
	toggleStatusSchema,
	getStockistsSchema
} = require('../validation/stockist.schemas');
const { 
	createStockist, 
	getAllStockists, 
	getStockistById, 
	updateStockist, 
	deleteStockist,
	toggleStockistStatus
} = require('../controllers/stockist.controller');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// All routes require Admin authentication
router.use(requireAdmin);

// Create a new stockist
router.post('/', validateBody(createStockistSchema), createStockist);

// Get all stockists with pagination and filters
router.get('/', validateQuery(getStockistsSchema), getAllStockists);

// Get stockist by ID
router.get('/:id', getStockistById);

// Update stockist
router.post('/:id', validateBody(updateStockistSchema), updateStockist);

// Toggle stockist active status
router.post('/:id/status', validateBody(toggleStatusSchema), toggleStockistStatus);

// Delete stockist
router.post('/:id/delete', deleteStockist);

module.exports = router;
