const Joi = require('joi');

// Page logic details validation schemas
const suffixSchema = Joi.object({
	type: Joi.string().valid('suffix').required(),
	match_length: Joi.number().integer().min(1).max(10).required(),
	pattern: Joi.string().valid('same_number').default('same_number')
});

const pageRangeSchema = Joi.object({
	type: Joi.string().valid('page_range').required(),
	pages: Joi.alternatives().try(
		Joi.array().items(Joi.number().integer().min(1)).min(1),
		Joi.object({
			from: Joi.number().integer().min(1).required(),
			to: Joi.number().integer().min(1).required()
		})
	).required(),
	apply_on: Joi.string().valid('page_number').default('page_number')
});

const letterSetSchema = Joi.object({
	type: Joi.string().valid('letter_set').required(),
	letters: Joi.array().items(Joi.string().length(1)).min(1).max(26).required(),
	apply_on: Joi.string().valid('prefix', 'suffix').default('prefix'),
	format: Joi.string().pattern(/^\{L\}\{NUMBER\}$/).default('{L}{NUMBER}')
});

const pageLogicDetailsSchema = Joi.alternatives().try(
	suffixSchema,
	pageRangeSchema,
	letterSetSchema
);

// Series numbers validation (accept CSV string, JSON-string, or array of numbers/strings)
const seriesNumbersSchema = Joi.alternatives().try(
    Joi.string().pattern(/^(\d+)(,\s*\d+)*$/),
    Joi.string().pattern(/^\[(\s*\d+\s*)(,\s*\d+\s*)*\]$/),
    Joi.array().items(Joi.alternatives().try(Joi.number().integer().min(0), Joi.string().pattern(/^\d+$/))).min(1)
);

// Main schemas
exports.createSameMasterSchema = Joi.object({
	same_number: Joi.string().min(1).max(50).required(),
	page_logic: Joi.string().valid('WITHOUT_PAGE_LOGIC', 'WITH_PAGE_LOGIC').default('WITHOUT_PAGE_LOGIC'),
	page_logic_details: pageLogicDetailsSchema.optional(),
	series_numbers: seriesNumbersSchema.optional(),
	page_no_logic: Joi.string().pattern(/^[A-Za-z]+$/).optional().allow(null, '').messages({
		'string.pattern.base': 'page_no_logic must contain only letters (e.g., "ABCDE")'
	}),
	is_active: Joi.boolean().optional(),
	priority: Joi.number().integer().min(0).max(1000).optional()
});

exports.updateSameMasterSchema = Joi.object({
	same_number: Joi.string().min(1).max(50).optional(),
	page_logic: Joi.string().valid('WITHOUT_PAGE_LOGIC', 'WITH_PAGE_LOGIC').optional(),
	page_logic_details: pageLogicDetailsSchema.optional(),
	series_numbers: seriesNumbersSchema.optional(),
	page_no_logic: Joi.string().pattern(/^[A-Za-z]+$/).optional().allow(null, '').messages({
		'string.pattern.base': 'page_no_logic must contain only letters (e.g., "ABCDE")'
	}),
	is_active: Joi.boolean().optional(),
	priority: Joi.number().integer().min(0).max(1000).optional()
}).min(1).messages({
	'object.min': 'At least one field must be provided for update'
});

// Matching engine input validation
exports.matchTicketsSchema = Joi.object({
	tickets: Joi.array().items(
		Joi.object({
			ticket_id: Joi.string().required(),
			ticket_no: Joi.string().required(),
			series: Joi.string().optional(),
			page_number: Joi.number().integer().min(1).optional(),
			metadata: Joi.object().optional()
		})
	).min(1).required()
});

// Letters validation (accept string 'ABCDE', CSV 'A,B,C', or array ['A','B'])
const lettersSchema = Joi.alternatives().try(
    Joi.string().pattern(/^[A-Za-z,\[\]\s]+$/).min(1).max(100),
    Joi.array().items(Joi.string().length(1).regex(/^[A-Za-z]$/)).min(1).max(26)
);

// Combination generator input validation (more permissive; controller normalizes)
exports.generateCombinationsSchema = Joi.object({
    same_number: Joi.alternatives().try(
        Joi.number().integer().min(0),
        Joi.string().min(1).max(50)
    ).required(),
    series_numbers: seriesNumbersSchema.required(),
    letters: lettersSchema.required()
});
