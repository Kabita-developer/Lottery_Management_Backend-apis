const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const superAdminSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['super_admin'], default: 'super_admin', immutable: true },
		isActive: { type: Boolean, default: true },
		passwordResetToken: { type: String },
		passwordResetExpires: { type: Date }
	},
	{ timestamps: true }
);

superAdminSchema.methods.comparePassword = async function (plainPassword) {
	return bcrypt.compare(plainPassword, this.passwordHash);
};

superAdminSchema.statics.hashPassword = async function (plainPassword) {
	const saltRounds = 10;
	return bcrypt.hash(plainPassword, saltRounds);
};

module.exports = mongoose.model('SuperAdmin', superAdminSchema);


