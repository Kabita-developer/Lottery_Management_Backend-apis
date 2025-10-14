const Joi = require('joi');

const email = Joi.string().email().lowercase().required();
const password = Joi.string().min(8).max(72).required();
const phone = Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required();
const resetToken = Joi.string().required();

const addressSchema = Joi.object({
	street: Joi.string().min(1).max(200).required(),
	city: Joi.string().min(1).max(100).required(),
	state: Joi.string().min(1).max(100).required(),
	country: Joi.string().min(1).max(100).required(),
	zipCode: Joi.string().min(1).max(20).required()
});

exports.signupSchema = Joi.object({
	firstName: Joi.string().min(1).max(50).required(),
	lastName: Joi.string().min(1).max(50).required(),
	email,
	address: addressSchema,
	phone,
	password
});

exports.loginSchema = Joi.object({
	email,
	password
});

exports.forgotPasswordSchema = Joi.object({
	email
});

exports.resetPasswordSchema = Joi.object({
	token: resetToken,
	newPassword: password
});

exports.changePasswordSchema = Joi.object({
	currentPassword: password,
	newPassword: password
});
