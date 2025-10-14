const mongoose = require('mongoose');

const sameMasterSchema = new mongoose.Schema(
	{
		same_number: {
			type: String,
			required: true,
			index: true
		},
		page_logic: {
			type: String,
			enum: ['WITHOUT_PAGE_LOGIC', 'WITH_PAGE_LOGIC'],
			default: 'WITHOUT_PAGE_LOGIC',
			required: true
		},
		page_logic_details: {
			type: mongoose.Schema.Types.Mixed, // JSONB equivalent
			default: null,
			validate: {
				validator: function(v) {
					if (v === null || v === undefined) return true;
					// Validate JSON structure based on type
					if (typeof v === 'object' && v.type) {
						const validTypes = ['suffix', 'page_range', 'letter_set'];
						return validTypes.includes(v.type);
					}
					return false;
				},
				message: 'page_logic_details must be a valid JSON object with type field'
			}
		},
		series_numbers: {
			type: String,
			default: null,
			validate: {
				validator: function(v) {
					if (!v) return true;
					// Validate comma-separated numbers or JSON array
					try {
						if (v.startsWith('[') && v.endsWith(']')) {
							JSON.parse(v);
							return true;
						}
						// Check if it's comma-separated numbers
						const numbers = v.split(',').map(n => n.trim());
						return numbers.every(n => /^\d+$/.test(n));
					} catch (e) {
						return false;
					}
				},
				message: 'series_numbers must be comma-separated numbers or valid JSON array'
			}
		},
		page_no_logic: {
			type: String,
			default: null,
			validate: {
				validator: function(v) {
					if (!v) return true;
					// Validate that it contains only letters (like "ABCDE")
					return /^[A-Za-z]+$/.test(v);
				},
				message: 'page_no_logic must contain only letters (e.g., "ABCDE")'
			}
		},
		is_active: {
			type: Boolean,
			default: true,
			index: true
		},
		priority: {
			type: Number,
			default: 0,
			index: true
		},
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SuperAdmin',
			default: null
		}
	},
	{ timestamps: true }
);

// Compound indexes for performance
sameMasterSchema.index({ same_number: 1, is_active: 1 });
sameMasterSchema.index({ is_active: 1, priority: -1 });
sameMasterSchema.index({ created_at: -1 });

// Virtual for parsed series numbers
sameMasterSchema.virtual('parsedSeriesNumbers').get(function() {
	if (!this.series_numbers) return [];
	try {
		if (this.series_numbers.startsWith('[') && this.series_numbers.endsWith(']')) {
			return JSON.parse(this.series_numbers);
		}
		return this.series_numbers.split(',').map(n => n.trim());
	} catch (e) {
		return [];
	}
});

// Method to check if rule matches a ticket (basic validation)
sameMasterSchema.methods.matchesTicket = function(ticket) {
	if (!this.is_active) return false;
	
	if (this.page_logic === 'WITHOUT_PAGE_LOGIC') {
		// Basic matching logic - will be expanded in matching engine
		return true; // Placeholder
	} else {
		// Page logic matching - will be expanded in matching engine
		return true; // Placeholder
	}
};

module.exports = mongoose.model('SameMaster', sameMasterSchema);
