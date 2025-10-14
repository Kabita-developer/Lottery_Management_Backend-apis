const express = require('express');
const { validateBody } = require('../shared/validate');
const { 
	createSameMasterSchema, 
	updateSameMasterSchema,
	matchTicketsSchema,
	generateCombinationsSchema
} = require('../validation/sameMaster.schemas');
const { 
	createSameMaster, 
	getAllSameMaster, 
	getSameMasterById, 
	updateSameMaster, 
	deleteSameMaster,
	matchTickets,
	generateCombinations,
	getAuditLogs,
	testCombinationGenerator
} = require('../controllers/sameMaster.controller');
const { requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Test endpoint (no validation, no auth for testing) - MUST be before auth middleware
router.get('/test-combination-generator', testCombinationGenerator);

// Test endpoint with validation but no auth
router.post('/test-generate-combinations', generateCombinations);

// Debug endpoint to test auth flow
router.get('/debug-auth', requireSuperAdmin, (req, res) => {
	res.json({
		success: true,
		message: 'Authentication successful',
		data: {
			auth: req.auth,
			timestamp: new Date().toISOString(),
			headers: req.headers
		}
	});
});

// Test authentication endpoint
router.get('/test-auth', requireSuperAdmin, (req, res) => {
	res.json({
		success: true,
		message: 'Authentication successful',
		data: {
			user: req.auth
		}
	});
});

// Simple test route
router.get('/test-simple', (req, res) => {
	res.json({
		success: true,
		message: 'Simple test route works',
		data: null
	});
});

// All other routes require Super Admin authentication
router.use(requireSuperAdmin);

// Create first (literal path)
router.post('/', validateBody(createSameMasterSchema), createSameMaster);

// Matching engine (place BEFORE parameterized routes like '/:id')
router.post('/match-tickets', validateBody(matchTicketsSchema), matchTickets);

// Combination generator (place BEFORE parameterized routes like '/:id')
router.post('/generate-combinations', (req, res) => {
	try {
		const { same_number, series_numbers, letters } = req.body;
		
		// Basic validation
		if (!same_number || !series_numbers || !letters) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields: same_number, series_numbers, letters',
				data: null
			});
		}
		
		// Validate letters format
		if (!/^[A-Z]+$/.test(letters)) {
			return res.status(400).json({
				success: false,
				message: 'Letters must contain only uppercase letters (A-Z)',
				data: null
			});
		}
		
		// Parse series numbers
		let series;
		try {
			if (series_numbers.startsWith('[') && series_numbers.endsWith(']')) {
				series = JSON.parse(series_numbers);
			} else {
				series = series_numbers.split(',').map(n => n.trim()).filter(n => n);
			}
		} catch (e) {
			return res.status(400).json({
				success: false,
				message: 'Invalid series_numbers format. Use comma-separated numbers or JSON array',
				data: null
			});
		}
		
		if (series.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'No valid series numbers found',
				data: null
			});
		}
		
		// Generate combinations
		const letterArray = letters.split('');
		const combinations = [];
		
		series.forEach(seriesNum => {
			const seriesCombinations = [];
			letterArray.forEach(letter => {
				seriesCombinations.push(`${seriesNum}${letter}`);
			});
			combinations.push(seriesCombinations.join(','));
		});
		
		const result = {
			same_number: same_number,
			series_numbers: series_numbers,
			letters: letters,
			combinations: combinations,
			total_combinations: combinations.length * letterArray.length
		};
		
		return res.status(200).json({
			success: true,
			message: 'Combinations generated successfully',
			data: result
		});
	} catch (err) {
		console.error('Error generating combinations:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: {
				error: err.message
			}
		});
	}
});

// List and detail (literal path before param)
router.get('/', getAllSameMaster);
router.get('/:id', getSameMasterById);

// Update and delete (parameterized routes last)
router.post('/:id', validateBody(updateSameMasterSchema), updateSameMaster);
router.post('/delete/:id', deleteSameMaster);

// Audit logs
router.get('/audit/logs', getAuditLogs);

module.exports = router;
