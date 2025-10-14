const Joi = require('joi');

const email = Joi.string().email().lowercase().required();
const password = Joi.string().min(8).max(72).required();
const resetToken = Joi.string().required();

exports.signupSchema = Joi.object({
	fullName: Joi.string().min(2).max(100).required(),
	email,
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
