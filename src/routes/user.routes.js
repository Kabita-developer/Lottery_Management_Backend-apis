const express = require('express');
const { validateBody } = require('../shared/validate');
const { 
	signupSchema, 
	loginSchema, 
	forgotPasswordSchema, 
	resetPasswordSchema, 
	changePasswordSchema 
} = require('../validation/user.schemas');
const { 
	signup, 
	login, 
	logout, 
	forgotPassword, 
	resetPassword, 
	changePassword,
	whoAmI
} = require('../controllers/user.controller');
const { requireUser } = require('../middleware/userAuth');

const router = express.Router();

// User signup and login (no pre-authentication required)
router.post('/signup', validateBody(signupSchema), signup);
router.post('/login', validateBody(loginSchema), login);

// Password reset flow (no authentication required)
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

// Change password (requires authentication)
router.post('/change-password', requireUser, validateBody(changePasswordSchema), changePassword);

// Logout requires valid user JWT token
router.post('/logout', requireUser, logout);

// Get current user profile (requires authentication)
router.get('/whoami', requireUser, whoAmI);

module.exports = router;
