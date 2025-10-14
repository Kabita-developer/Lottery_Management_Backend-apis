const express = require('express');
const { validateBody } = require('../shared/validate');
const { 
	signupSchema, 
	loginSchema, 
	forgotPasswordSchema, 
	resetPasswordSchema, 
	changePasswordSchema 
} = require('../validation/superAdmin.schemas');
const { 
	signup, 
	login, 
	generatePreAuthToken, 
	logout, 
	forgotPassword, 
	resetPassword, 
	changePassword 
} = require('../controllers/superAdmin.controller');
const { requireSuperAdminPreAuth } = require('../middleware/superAdminPreAuth');
const { requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Signup doesn't require pre-auth (initial super admin creation)
router.post('/signup', validateBody(signupSchema), signup);

// Generate pre-authentication token (for system administrators)
router.get('/pre-auth-token', generatePreAuthToken);

// Login now requires pre-authentication with JWT token
router.post('/login', requireSuperAdminPreAuth, validateBody(loginSchema), login);

// Password reset flow (no authentication required)
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

// Change password (requires authentication)
router.post('/change-password', requireSuperAdmin, validateBody(changePasswordSchema), changePassword);

// Logout requires valid super admin JWT token
router.post('/logout', requireSuperAdmin, logout);

module.exports = router;


