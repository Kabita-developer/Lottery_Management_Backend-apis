const Joi = require('joi');

// Common validation patterns
const aadharId = Joi.string()
	.pattern(/^\d{12}$/)
	.required()
	.messages({
		'string.pattern.base': 'Aadhar ID must be exactly 12 digits'
	});

const panNo = Joi.string()
	.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
	.required()
	.messages({
		'string.pattern.base': 'PAN number must be in format: ABCDE1234F'
	});

const pinCode = Joi.string()
	.pattern(/^\d{6}$/)
	.required()
	.messages({
		'string.pattern.base': 'PIN code must be exactly 6 digits'
	});

const phone = Joi.string()
	.pattern(/^[\+]?[1-9][\d]{0,15}$/)
	.required()
	.messages({
		'string.pattern.base': 'Phone number must be valid'
	});

const email = Joi.string()
	.email()
	.lowercase()
	.required()
	.messages({
		'string.email': 'Email must be valid'
	});

// Create Stockist schema
exports.createStockistSchema = Joi.object({
	code: Joi.string()
		.min(1)
		.max(50)
		.required()
		.trim()
		.messages({
			'string.min': 'Code must be at least 1 character',
			'string.max': 'Code cannot exceed 50 characters',
			'any.required': 'Code is required'
		}),
	name: Joi.string()
		.min(2)
		.max(100)
		.required()
		.trim()
		.messages({
			'string.min': 'Name must be at least 2 characters',
			'string.max': 'Name cannot exceed 100 characters',
			'any.required': 'Name is required'
		}),
	aadharId,
	aadharName: Joi.string()
		.min(2)
		.max(100)
		.required()
		.trim()
		.messages({
			'string.min': 'Aadhar name must be at least 2 characters',
			'string.max': 'Aadhar name cannot exceed 100 characters',
			'any.required': 'Aadhar name is required'
		}),
	address1: Joi.string()
		.min(5)
		.max(200)
		.required()
		.trim()
		.messages({
			'string.min': 'Address1 must be at least 5 characters',
			'string.max': 'Address1 cannot exceed 200 characters',
			'any.required': 'Address1 is required'
		}),
	address2: Joi.string()
		.max(200)
		.allow('')
		.optional()
		.trim()
		.messages({
			'string.max': 'Address2 cannot exceed 200 characters'
		}),
	pinCode,
	phone,
	email,
	panNo,
	type: Joi.string()
		.valid('Credit Party', 'Debit Party')
		.required()
		.messages({
			'any.only': 'Type must be either "Credit Party" or "Debit Party"',
			'any.required': 'Type is required'
		}),
	device: Joi.string()
		.max(100)
		.allow('')
		.optional()
		.trim()
		.messages({
			'string.max': 'Device cannot exceed 100 characters'
		}),
	active: Joi.boolean()
		.optional()
		.default(true),
	isSeller: Joi.boolean()
		.optional()
		.default(false),
	allowMail: Joi.boolean()
		.optional()
		.default(true)
});

// Update Stockist schema (all fields optional except validation rules)
exports.updateStockistSchema = Joi.object({
	code: Joi.string()
		.min(1)
		.max(50)
		.optional()
		.trim()
		.messages({
			'string.min': 'Code must be at least 1 character',
			'string.max': 'Code cannot exceed 50 characters'
		}),
	name: Joi.string()
		.min(2)
		.max(100)
		.optional()
		.trim()
		.messages({
			'string.min': 'Name must be at least 2 characters',
			'string.max': 'Name cannot exceed 100 characters'
		}),
	aadharId: Joi.string()
		.pattern(/^\d{12}$/)
		.optional()
		.messages({
			'string.pattern.base': 'Aadhar ID must be exactly 12 digits'
		}),
	aadharName: Joi.string()
		.min(2)
		.max(100)
		.optional()
		.trim()
		.messages({
			'string.min': 'Aadhar name must be at least 2 characters',
			'string.max': 'Aadhar name cannot exceed 100 characters'
		}),
	address1: Joi.string()
		.min(5)
		.max(200)
		.optional()
		.trim()
		.messages({
			'string.min': 'Address1 must be at least 5 characters',
			'string.max': 'Address1 cannot exceed 200 characters'
		}),
	address2: Joi.string()
		.max(200)
		.allow('')
		.optional()
		.trim()
		.messages({
			'string.max': 'Address2 cannot exceed 200 characters'
		}),
	pinCode: Joi.string()
		.pattern(/^\d{6}$/)
		.optional()
		.messages({
			'string.pattern.base': 'PIN code must be exactly 6 digits'
		}),
	phone: Joi.string()
		.pattern(/^[\+]?[1-9][\d]{0,15}$/)
		.optional()
		.messages({
			'string.pattern.base': 'Phone number must be valid'
		}),
	email: Joi.string()
		.email()
		.lowercase()
		.optional()
		.messages({
			'string.email': 'Email must be valid'
		}),
	panNo: Joi.string()
		.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
		.optional()
		.messages({
			'string.pattern.base': 'PAN number must be in format: ABCDE1234F'
		}),
	type: Joi.string()
		.valid('Credit Party', 'Debit Party')
		.optional()
		.messages({
			'any.only': 'Type must be either "Credit Party" or "Debit Party"'
		}),
	device: Joi.string()
		.max(100)
		.allow('')
		.optional()
		.trim()
		.messages({
			'string.max': 'Device cannot exceed 100 characters'
		}),
	active: Joi.boolean()
		.optional(),
	isSeller: Joi.boolean()
		.optional(),
	allowMail: Joi.boolean()
		.optional()
}).min(1).messages({
	'object.min': 'At least one field must be provided for update'
});

// Toggle status schema
exports.toggleStatusSchema = Joi.object({
	active: Joi.boolean()
		.required()
		.messages({
			'any.required': 'Active status is required'
		})
});

// Search/Filter schema for GET requests
exports.getStockistsSchema = Joi.object({
	page: Joi.number()
		.integer()
		.min(1)
		.optional()
		.default(1),
	limit: Joi.number()
		.integer()
		.min(1)
		.max(100)
		.optional()
		.default(10),
	search: Joi.string()
		.max(100)
		.optional()
		.trim(),
	type: Joi.string()
		.valid('Credit Party', 'Debit Party')
		.optional(),
	active: Joi.boolean()
		.optional(),
	isSeller: Joi.boolean()
		.optional(),
	allowMail: Joi.boolean()
		.optional()
});
