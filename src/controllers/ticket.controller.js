const Ticket = require('../models/Ticket');

exports.getAllTickets = async (req, res) => {
    try {
        // Super Admin enforced at route level
        const { page = 1, limit = 10, status, search } = req.query;

        const numericPage = Math.max(1, parseInt(page));
        const numericLimit = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (numericPage - 1) * numericLimit;

        const filter = {};
        if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
            filter.status = status;
        }
        if (search && search.trim()) {
            const q = search.trim();
            filter.$or = [
                { item_code: { $regex: q, $options: 'i' } },
                { full_ticket_name: { $regex: q, $options: 'i' } },
                { group_name: { $regex: q, $options: 'i' } },
                { state_name: { $regex: q, $options: 'i' } },
                { ticket_unique_id: { $regex: q, $options: 'i' } }
            ];
        }

        const [tickets, total] = await Promise.all([
            Ticket.find(filter)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(numericLimit)
                .select('-__v'),
            Ticket.countDocuments(filter)
        ]);

        const data = tickets.map(t => ({
            id: t._id,
            item_code: t.item_code,
            full_ticket_name: t.full_ticket_name,
            group_name: t.group_name,
            draw_time: t.draw_time,
            draw_day: t.draw_day,
            ticket_type: t.ticket_type,
            state_name: t.state_name,
            number_of_digits: t.number_of_digits,
            book_contains: t.book_contains,
            ticket_unique_id: t.ticket_unique_id,
            select_same: t.select_same,
            status: t.status,
            approved_by: t.approved_by,
            approved_at: t.approved_at,
            rejection_reason: t.rejection_reason,
            created_at: t.created_at,
            updated_at: t.updated_at
        }));

        return res.status(200).json({
            success: true,
            message: 'Tickets retrieved successfully',
            data: {
                tickets: data,
                pagination: {
                    current_page: numericPage,
                    total_pages: Math.ceil(total / numericLimit),
                    total_records: total,
                    limit: numericLimit
                }
            }
        });
    } catch (err) {
        console.error('Error fetching tickets:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
};

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
				_id: ticket._id,
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

exports.getTicketById = async (req, res) => {
    try {
        // Super Admin enforced at route level
        const { id } = req.params; // MongoDB ObjectId

        const ticket = await Ticket.findById(id).select('-__v');
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Ticket retrieved successfully',
            data: {
                id: ticket._id,
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
                status: ticket.status,
                approved_by: ticket.approved_by,
                approved_at: ticket.approved_at,
                rejection_reason: ticket.rejection_reason,
                created_at: ticket.created_at,
                updated_at: ticket.updated_at
            }
        });
    } catch (err) {
        console.error('Error fetching ticket by id:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
};

exports.approveTicket = async (req, res) => {
    try {
        const { id } = req.params; // MongoDB ObjectId
        const { action, rejection_reason } = req.body;

        // Ensure only super admins can approve
        if (!req.auth || req.auth.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only super admins can approve or reject tickets.',
                data: null
            });
        }

        // Find ticket by MongoDB ObjectId
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
                data: null
            });
        }

        // Only pending tickets can be acted upon
        if (ticket.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Ticket is already ${ticket.status}`,
                data: null
            });
        }

        // Apply action
        const now = new Date();
        ticket.approved_by = req.auth.sub;
        ticket.approved_at = now;

        if (action === 'accept') {
            ticket.status = 'accepted';
            ticket.rejection_reason = null;
        } else if (action === 'reject') {
            ticket.status = 'rejected';
            ticket.rejection_reason = rejection_reason || null;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "accept" or "reject".',
                data: null
            });
        }

        await ticket.save();

        return res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            data: {
                id: ticket._id,
                item_code: ticket.item_code,
                status: ticket.status,
                approved_by: ticket.approved_by,
                approved_at: ticket.approved_at,
                rejection_reason: ticket.rejection_reason,
                updated_at: ticket.updated_at
            }
        });
    } catch (err) {
        console.error('Error approving ticket:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: {
                error: 'INTERNAL_SERVER_ERROR',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            }
        });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        // Super Admin enforced at route level
        const { id } = req.params; // MongoDB ObjectId

        const ticket = await Ticket.findByIdAndDelete(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Ticket deleted successfully',
            data: {
                id: ticket._id,
                item_code: ticket.item_code,
                status: ticket.status,
                deleted_at: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('Error deleting ticket:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
};

