const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['admin'], default: 'admin', immutable: true },
		isActive: { type: Boolean, default: true },
		passwordResetToken: { type: String },
		passwordResetExpires: { type: Date }
	},
	{ timestamps: true }
);

adminSchema.methods.comparePassword = async function (plainPassword) {
	return bcrypt.compare(plainPassword, this.passwordHash);
};

adminSchema.statics.hashPassword = async function (plainPassword) {
	const saltRounds = 10;
	return bcrypt.hash(plainPassword, saltRounds);
};

module.exports = mongoose.model('Admin', adminSchema);
