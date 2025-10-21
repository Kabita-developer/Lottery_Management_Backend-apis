const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SuperAdmin = require('../models/SuperAdmin');
const config = require('../config');

function generateJwtToken(superAdminId) {
	const payload = { sub: superAdminId, role: 'super_admin' };
	return jwt.sign(payload, config.jwts.secret, { expiresIn: config.jwts.expiresIn });
}

function generatePreAuthToken() {
	const payload = { 
		sub: 'pre_auth', 
		role: 'super_admin_pre_auth',
		purpose: 'super_admin_login_access'
	};
	return jwt.sign(payload, config.jwts.secret, { expiresIn: '1h' }); // Short-lived token
}

exports.signup = async (req, res) => {
	try {
		const { fullName, email, password } = req.body;
		const existing = await SuperAdmin.findOne({ email });
		if (existing) return res.status(409).json({ message: 'Email already registered' });

		const passwordHash = await SuperAdmin.hashPassword(password);
		const superAdmin = await SuperAdmin.create({ fullName, email, passwordHash });
		const token = generateJwtToken(superAdmin._id.toString());
		return res.status(201).json({
			message: 'Super admin created successfully',
			data: {
				id: superAdmin._id,
				fullName: superAdmin.fullName,
				email: superAdmin.email,
				role: superAdmin.role
			},
			token
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const superAdmin = await SuperAdmin.findOne({ email });
		if (!superAdmin) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await superAdmin.comparePassword(password);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		if (!superAdmin.isActive) return res.status(403).json({ message: 'Account disabled' });
		const token = generateJwtToken(superAdmin._id.toString());
		return res.status(200).json({
			message: 'Login successful',
			data: {
				id: superAdmin._id,
				fullName: superAdmin.fullName,
				email: superAdmin.email,
				role: superAdmin.role
			},
			token
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.generatePreAuthToken = async (req, res) => {
	try {
		// This endpoint should be protected and only accessible by system administrators
		// For now, we'll make it accessible but in production, you might want additional security
		const preAuthToken = generatePreAuthToken();
		return res.status(200).json({
			message: 'Pre-authentication token generated successfully',
			token: preAuthToken,
			expiresIn: '1 hour',
			usage: 'Use this token in Authorization header to access super admin login'
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.logout = async (req, res) => {
	try {
		// Get the super admin ID from the authenticated request
		const superAdminId = req.auth.sub;
		
		// In a stateless JWT system, logout is typically handled client-side
		// by removing the token. However, we can log the logout event server-side
		// and potentially implement token blacklisting in the future
		
		// Log the logout event (you could save this to a database for audit purposes)
		console.log(`Super Admin logout: ${superAdminId} at ${new Date().toISOString()}`);
		
		return res.status(200).json({
			message: 'Logout successful',
			data: {
				superAdminId: superAdminId,
				logoutTime: new Date().toISOString()
			}
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		
		// Find super admin by email
		const superAdmin = await SuperAdmin.findOne({ email });
		if (!superAdmin) {
			// Don't reveal if email exists or not for security
			return res.status(200).json({
				message: 'If the email exists, a password reset link has been sent'
			});
		}
		
		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString('hex');
		const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
		
		// Save reset token to database
		superAdmin.passwordResetToken = resetToken;
		superAdmin.passwordResetExpires = resetTokenExpiry;
		await superAdmin.save();
		
		// In a real application, you would send an email here
		// For now, we'll log the reset token (remove this in production)
		console.log(`Password reset token for ${email}: ${resetToken}`);
		
		return res.status(200).json({
			message: 'If the email exists, a password reset link has been sent',
			resetToken: resetToken
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.resetPassword = async (req, res) => {
	try {
		const { token, newPassword } = req.body;
		
		// Find super admin with valid reset token
		const superAdmin = await SuperAdmin.findOne({
			passwordResetToken: token,
			passwordResetExpires: { $gt: Date.now() }
		});
		
		if (!superAdmin) {
			return res.status(400).json({
				message: 'Invalid or expired reset token'
			});
		}
		
		// Hash new password
		const passwordHash = await SuperAdmin.hashPassword(newPassword);
		
		// Update password and clear reset token
		superAdmin.passwordHash = passwordHash;
		superAdmin.passwordResetToken = undefined;
		superAdmin.passwordResetExpires = undefined;
		await superAdmin.save();
		
		// Log password reset event
		console.log(`Super Admin password reset: ${superAdmin.email} at ${new Date().toISOString()}`);
		
		return res.status(200).json({
			message: 'Password reset successful'
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const superAdminId = req.auth.sub;
		
		// Find super admin
		const superAdmin = await SuperAdmin.findById(superAdminId);
		if (!superAdmin) {
			return res.status(404).json({ message: 'Super admin not found' });
		}
		
		// Verify current password
		const isCurrentPasswordValid = await superAdmin.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			return res.status(400).json({ message: 'Current password is incorrect' });
		}
		
		// Hash new password
		const passwordHash = await SuperAdmin.hashPassword(newPassword);
		
		// Update password
		superAdmin.passwordHash = passwordHash;
		await superAdmin.save();
		
		// Log password change event
		console.log(`Super Admin password changed: ${superAdmin.email} at ${new Date().toISOString()}`);
		
		return res.status(200).json({
			message: 'Password changed successfully'
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.whoAmI = async (req, res) => {
	try {
		const superAdminId = req.auth.sub;
		
		// Find super admin
		const superAdmin = await SuperAdmin.findById(superAdminId);
		if (!superAdmin) {
			return res.status(404).json({ 
				success: false,
				message: 'Super admin not found' 
			});
		}
		
		// Check if super admin is active
		if (!superAdmin.isActive) {
			return res.status(403).json({ 
				success: false,
				message: 'Account is disabled' 
			});
		}
		
		return res.status(200).json({
			success: true,
			message: 'Super admin profile retrieved successfully',
			data: {
				id: superAdmin._id,
				fullName: superAdmin.fullName,
				email: superAdmin.email,
				role: superAdmin.role,
				isActive: superAdmin.isActive,
				created_at: superAdmin.createdAt,
				updated_at: superAdmin.updatedAt
			}
		});
	} catch (err) {
		console.error('Error fetching super admin profile:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Internal server error' 
		});
	}
};


