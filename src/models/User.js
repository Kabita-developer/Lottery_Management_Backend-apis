const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const addressSchema = new mongoose.Schema({
	street: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	country: { type: String, required: true },
	zipCode: { type: String, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		address: { type: addressSchema, required: true },
		phone: { type: String, required: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['user'], default: 'user', immutable: true },
		isActive: { type: Boolean, default: true },
		passwordResetToken: { type: String },
		passwordResetExpires: { type: Date }
	},
	{ timestamps: true }
);

userSchema.methods.comparePassword = async function (plainPassword) {
	return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plainPassword) {
	const saltRounds = 10;
	return bcrypt.hash(plainPassword, saltRounds);
};

module.exports = mongoose.model('User', userSchema);
