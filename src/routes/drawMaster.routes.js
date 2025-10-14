const express = require('express');
const { validateBody } = require('../shared/validate');
const { 
	createDrawMasterSchema, 
	updateDrawMasterSchema 
} = require('../validation/drawMaster.schemas');
const { 
	createDraw, 
	getAllDraws, 
	getDrawById, 
	updateDraw, 
	deleteDraw 
} = require('../controllers/drawMaster.controller');
const { requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require Super Admin authentication
router.use(requireSuperAdmin);

// Create a new draw
router.post('/', validateBody(createDrawMasterSchema), createDraw);

// Get all draws
router.get('/', getAllDraws);

// Get a single draw by ID
router.get('/:id', getDrawById);

// Update a draw
router.post('/:id', validateBody(updateDrawMasterSchema), updateDraw);

// Delete a draw
router.post('/delete/:id', deleteDraw);

module.exports = router;
