const express = require('express');
const { validateBody } = require('../shared/validate');
const { requireUser } = require('../middleware/userAuth');
const { createTicketSchema } = require('../validation/ticket.schemas');
const { createTicket } = require('../controllers/ticket.controller');
const Ticket = require('../models/Ticket');

const router = express.Router();

// Test endpoint without authentication for debugging
router.get('/test', async (req, res) => {
	try {
		// Test database connection
		const count = await Ticket.countDocuments();
		return res.json({
			success: true,
			message: 'Database connection successful',
			data: {
				totalTickets: count,
				timestamp: new Date().toISOString()
			}
		});
	} catch (err) {
		console.error('Test endpoint error:', err);
		return res.status(500).json({
			success: false,
			message: 'Database connection failed',
			data: {
				error: err.name,
				message: err.message,
				stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
			}
		});
	}
});

// Test endpoint to create a simple ticket without validation
router.post('/test-create', async (req, res) => {
	try {
		const ticket = await Ticket.create({
			item_code: 'TEST-001'
		});
		
		return res.status(201).json({
			success: true,
			message: 'Test ticket created successfully',
			data: ticket
		});
	} catch (err) {
		console.error('Test create error:', err);
		return res.status(500).json({
			success: false,
			message: 'Test ticket creation failed',
			data: {
				error: err.name,
				message: err.message,
				code: err.code,
				stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
			}
		});
	}
});

router.use(requireUser);

router.post('/', validateBody(createTicketSchema), createTicket);

module.exports = router;


