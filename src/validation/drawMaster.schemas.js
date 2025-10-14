const Joi = require('joi');

// Time object schema for drawTime and lastUnsoldTime
const timeObjectSchema = Joi.object({
	date: Joi.string().pattern(/^[0-9]{2}-[0-9]{2}-[0-9]{2}$/).required()
		.messages({
			'string.pattern.base': 'Date must be in format: "21-01-20"'
		}),
	time: Joi.string().pattern(/^[0-9]{2}:[0-9]{2}$/).required()
		.messages({
			'string.pattern.base': 'Time must be in format: "10:30"'
		})
}).required();

const sellingRate = Joi.number().min(0).max(100).required()
	.messages({
		'number.min': 'Selling rate cannot be negative',
		'number.max': 'Selling rate cannot exceed 100%'
	});

exports.createDrawMasterSchema = Joi.object({
	drawTime: timeObjectSchema,
	lastUnsoldTime: timeObjectSchema,
	sellingRate: sellingRate
});

exports.updateDrawMasterSchema = Joi.object({
	drawTime: timeObjectSchema.optional(),
	lastUnsoldTime: timeObjectSchema.optional(),
	sellingRate: sellingRate.optional()
}).min(1).messages({
	'object.min': 'At least one field must be provided for update'
});
