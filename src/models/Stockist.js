const mongoose = require('mongoose');

const stockistSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			index: true
		},
		name: {
			type: String,
			required: true,
			trim: true
		},
		aadharId: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			validate: {
				validator: function(v) {
					return /^\d{12}$/.test(v);
				},
				message: 'Aadhar ID must be exactly 12 digits'
			}
		},
		aadharName: {
			type: String,
			required: true,
			trim: true
		},
		address1: {
			type: String,
			required: true,
			trim: true
		},
		address2: {
			type: String,
			trim: true,
			default: ''
		},
		pinCode: {
			type: String,
			required: true,
			trim: true,
			validate: {
				validator: function(v) {
					return /^\d{6}$/.test(v);
				},
				message: 'PIN code must be exactly 6 digits'
			}
		},
		phone: {
			type: String,
			required: true,
			trim: true,
			validate: {
				validator: function(v) {
					return /^[\+]?[1-9][\d]{0,15}$/.test(v);
				},
				message: 'Phone number must be valid'
			}
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
			validate: {
				validator: function(v) {
					return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
				},
				message: 'Email must be valid'
			}
		},
		panNo: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			validate: {
				validator: function(v) {
					return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
				},
				message: 'PAN number must be in format: ABCDE1234F'
			}
		},
		type: {
			type: String,
			enum: ['Credit Party', 'Debit Party'],
			required: true,
			index: true
		},
		device: {
			type: String,
			trim: true,
			default: ''
		},
		active: {
			type: Boolean,
			default: true,
			index: true
		},
		isSeller: {
			type: Boolean,
			default: false,
			index: true
		},
		allowMail: {
			type: Boolean,
			default: true
		},
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Admin',
			required: true
		}
	},
	{ timestamps: true }
);

// Compound indexes for better query performance
stockistSchema.index({ code: 1, active: 1 });
stockistSchema.index({ type: 1, active: 1 });
stockistSchema.index({ isSeller: 1, active: 1 });
stockistSchema.index({ created_at: -1 });

// Virtual for full address
stockistSchema.virtual('fullAddress').get(function() {
	const address2 = this.address2 ? `, ${this.address2}` : '';
	return `${this.address1}${address2}, ${this.pinCode}`;
});

// Ensure MongoDB _id and __v are not leaked in API responses
stockistSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: (_doc, ret) => {
		delete ret._id;
		delete ret.__v;
		return ret;
	}
});

stockistSchema.set('toObject', {
	virtuals: true,
	versionKey: false,
	transform: (_doc, ret) => {
		delete ret._id;
		delete ret.__v;
		return ret;
	}
});

module.exports = mongoose.model('Stockist', stockistSchema);
