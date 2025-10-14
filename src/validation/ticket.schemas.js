const Joi = require('joi');

exports.createTicketSchema = Joi.object({
	item_code: Joi.string().min(1).max(100).required(),
	full_ticket_name: Joi.string().allow(null, '').optional(),
	group_name: Joi.string().allow(null, '').optional(),
	draw_time: Joi.string().allow(null, '').optional(),
	draw_day: Joi.string().allow(null, '').optional(),
	ticket_type: Joi.string().valid('Bumper', 'Weekly').allow(null, '').optional().messages({
		'any.only': 'ticket_type must be either "Bumper" or "Weekly"'
	}),
	state_name: Joi.string().allow(null, '').optional(),
	number_of_digits: Joi.number().integer().min(0).allow(null).optional(),
	book_contains: Joi.number().integer().min(0).allow(null).optional(),
	ticket_unique_id: Joi.string().allow(null, '').optional(),
	select_same: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null, '').optional().messages({
		'string.pattern.base': 'select_same must be a valid MongoDB ObjectId'
	})
});

// Approve/Reject Ticket schema
exports.approveTicketSchema = Joi.object({
	action: Joi.string().valid('accept', 'reject').required(),
	rejection_reason: Joi.when('action', {
		is: 'reject',
		then: Joi.string().min(1).max(500).required(),
		otherwise: Joi.forbidden()
	})
});


