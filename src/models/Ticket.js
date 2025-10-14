const mongoose = require('mongoose');

// Counter collection for auto-incrementing integer id
const counterSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const ticketSchema = new mongoose.Schema(
	{
		id: { type: Number, unique: true, index: true }, // Auto-incremented integer PK
		item_code: { 
			type: String, 
			required: [true, 'Item code is required'],
			trim: true,
			maxlength: [100, 'Item code cannot exceed 100 characters']
		},
		full_ticket_name: { 
			type: String, 
			default: null,
			trim: true
		},
		group_name: { 
			type: String, 
			default: null,
			trim: true
		},
		draw_time: { 
			type: String, 
			default: null,
			trim: true
		},
		draw_day: { 
			type: String, 
			default: null,
			trim: true
		},
		ticket_type: { 
			type: String, 
			enum: {
				values: ['Bumper', 'Weekly'],
				message: 'Ticket type must be either "Bumper" or "Weekly"'
			},
			default: null
		},
		state_name: { 
			type: String, 
			default: null,
			trim: true
		},
		number_of_digits: { 
			type: Number, 
			min: [0, 'Number of digits cannot be negative'],
			default: null
		},
		book_contains: { 
			type: Number, 
			min: [0, 'Book contains cannot be negative'],
			default: null
		},
		ticket_unique_id: { 
			type: String, 
			unique: true, 
			sparse: true, 
			default: null,
			trim: true
		},
		select_same: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SameMaster',
			default: null,
			index: true
		}
	},
	{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Pre-save hook to auto-increment id if not set
ticketSchema.pre('save', async function(next) {
	if (this.isNew && (this.id === undefined || this.id === null)) {
		try {
			const counter = await Counter.findByIdAndUpdate(
				'Ticket',
				{ $inc: { seq: 1 } },
				{ upsert: true, new: true }
			);
			this.id = counter.seq;
		} catch (err) {
			console.error('Error auto-incrementing ticket ID:', err);
			const error = new Error('Failed to generate ticket ID');
			error.name = 'AutoIncrementError';
			error.originalError = err;
			return next(error);
		}
	}
	return next();
});

module.exports = mongoose.model('Ticket', ticketSchema);


