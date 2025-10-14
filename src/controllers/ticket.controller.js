const Ticket = require('../models/Ticket');

exports.createTicket = async (req, res) => {
	try {
		const {
			item_code,
			full_ticket_name,
			group_name,
			draw_time,
			draw_day,
			ticket_type,
			state_name,
			number_of_digits,
			book_contains,
			ticket_unique_id,
			select_same
		} = req.body;

		// Check for duplicate ticket_unique_id if provided
		if (ticket_unique_id) {
			const existingTicket = await Ticket.findOne({ ticket_unique_id });
			if (existingTicket) {
				return res.status(409).json({
					success: false,
					message: 'Ticket with this unique ID already exists',
					data: {
						error: 'DUPLICATE_UNIQUE_ID',
						field: 'ticket_unique_id',
						value: ticket_unique_id
					}
				});
			}
		}

		const ticket = await Ticket.create({
			item_code,
			full_ticket_name,
			group_name,
			draw_time,
			draw_day,
			ticket_type,
			state_name,
			number_of_digits,
			book_contains,
			ticket_unique_id,
			select_same
		});

		return res.status(201).json({
			success: true,
			message: 'Ticket created successfully',
			data: {
				id: ticket.id,
				item_code: ticket.item_code,
				full_ticket_name: ticket.full_ticket_name,
				group_name: ticket.group_name,
				draw_time: ticket.draw_time,
				draw_day: ticket.draw_day,
				ticket_type: ticket.ticket_type,
				state_name: ticket.state_name,
				number_of_digits: ticket.number_of_digits,
				book_contains: ticket.book_contains,
				ticket_unique_id: ticket.ticket_unique_id,
				select_same: ticket.select_same,
				created_at: ticket.created_at
			}
		});
	} catch (err) {
		console.error('Error creating ticket:', err);
		
		// Handle specific MongoDB errors
		if (err.name === 'ValidationError') {
			const validationErrors = Object.values(err.errors).map(error => ({
				field: error.path,
				message: error.message,
				value: error.value
			}));
			
			return res.status(400).json({
				success: false,
				message: 'Validation failed',
				data: {
					error: 'VALIDATION_ERROR',
					errors: validationErrors
				}
			});
		}
		
		if (err.code === 11000) {
			// Duplicate key error
			const field = Object.keys(err.keyPattern)[0];
			return res.status(409).json({
				success: false,
				message: `Duplicate value for field: ${field}`,
				data: {
					error: 'DUPLICATE_KEY',
					field: field,
					value: err.keyValue[field]
				}
			});
		}
		
		if (err.name === 'CastError') {
			return res.status(400).json({
				success: false,
				message: `Invalid data type for field: ${err.path}`,
				data: {
					error: 'CAST_ERROR',
					field: err.path,
					expectedType: err.kind,
					receivedValue: err.value
				}
			});
		}
		
		// Handle auto-increment errors
		if (err.name === 'AutoIncrementError') {
			return res.status(500).json({
				success: false,
				message: 'Failed to generate ticket ID. Please try again.',
				data: {
					error: 'AUTO_INCREMENT_ERROR',
					details: 'Unable to generate unique ticket ID'
				}
			});
		}
		
		// Handle database connection errors
		if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
			return res.status(503).json({
				success: false,
				message: 'Database connection error. Please try again later.',
				data: {
					error: 'DATABASE_CONNECTION_ERROR',
					details: 'Unable to connect to database'
				}
			});
		}
		
		// Generic error fallback
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: {
				error: 'INTERNAL_SERVER_ERROR',
				details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
			}
		});
	}
};


