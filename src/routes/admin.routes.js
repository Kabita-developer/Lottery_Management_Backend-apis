const express = require('express');
const { validateBody } = require('../shared/validate');
const { 
	signupSchema, 
	loginSchema, 
	forgotPasswordSchema, 
	resetPasswordSchema, 
	changePasswordSchema 
} = require('../validation/admin.schemas');
const { 
	signup, 
	login, 
	generatePreAuthToken, 
	logout, 
	forgotPassword, 
	resetPassword, 
	changePassword,
	whoAmI
} = require('../controllers/admin.controller');
const { requireAdminPreAuth } = require('../middleware/adminPreAuth');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Signup doesn't require pre-auth (initial admin creation)
router.post('/signup', validateBody(signupSchema), signup);

// Generate pre-authentication token (for system administrators)
router.get('/pre-auth-token', generatePreAuthToken);

// Login without pre-authentication requirement
router.post('/login', validateBody(loginSchema), login);

// Password reset flow (no authentication required)
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

// Change password (requires authentication)
router.post('/change-password', requireAdmin, validateBody(changePasswordSchema), changePassword);

// Logout requires valid admin JWT token
router.post('/logout', requireAdmin, logout);

// Get current admin profile (requires authentication)
router.get('/whoami', requireAdmin, whoAmI);

module.exports = router;
