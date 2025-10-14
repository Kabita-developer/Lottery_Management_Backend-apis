const mongoose = require('mongoose');

const timeObjectSchema = new mongoose.Schema({
	date: {
		type: String,
		required: true,
		validate: {
			validator: function(v) {
				// Validate date format: "21-01-20"
				const regex = /^[0-9]{2}-[0-9]{2}-[0-9]{2}$/;
				return regex.test(v);
			},
			message: 'Date must be in format: "21-01-20"'
		}
	},
	time: {
		type: String,
		required: true,
		validate: {
			validator: function(v) {
				// Validate time format: "10:30"
				const regex = /^[0-9]{2}:[0-9]{2}$/;
				return regex.test(v);
			},
			message: 'Time must be in format: "10:30"'
		}
	}
}, { _id: false });

const drawMasterSchema = new mongoose.Schema(
	{
		drawTime: {
			type: timeObjectSchema,
			required: true
		},
		lastUnsoldTime: {
			type: timeObjectSchema,
			required: true
		},
		sellingRate: {
			type: Number,
			required: true,
			min: [0, 'Selling rate cannot be negative'],
			max: [100, 'Selling rate cannot exceed 100%']
		}
	},
	{ timestamps: true }
);

// Add indexes for better query performance
drawMasterSchema.index({ drawTime: 1 });
drawMasterSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DrawMaster', drawMasterSchema);
