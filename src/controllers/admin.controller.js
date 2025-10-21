const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const config = require('../config');

function generateJwtToken(adminId) {
	const payload = { sub: adminId, role: 'admin' };
	return jwt.sign(payload, config.jwts.secret, { expiresIn: config.jwts.expiresIn });
}

function generatePreAuthToken() {
	const payload = { 
		sub: 'pre_auth', 
		role: 'admin_pre_auth',
		purpose: 'admin_login_access'
	};
	return jwt.sign(payload, config.jwts.secret, { expiresIn: '1h' }); // Short-lived token
}

exports.signup = async (req, res) => {
	try {
		const { fullName, email, password } = req.body;
		const existing = await Admin.findOne({ email });
		if (existing) return res.status(409).json({ message: 'Email already registered' });

		const passwordHash = await Admin.hashPassword(password);
		const admin = await Admin.create({ fullName, email, passwordHash });
		const token = generateJwtToken(admin._id.toString());
		return res.status(201).json({
			message: 'Admin created successfully',
			data: {
				id: admin._id,
				fullName: admin.fullName,
				email: admin.email,
				role: admin.role
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
		const admin = await Admin.findOne({ email });
		if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await admin.comparePassword(password);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		if (!admin.isActive) return res.status(403).json({ message: 'Account disabled' });
		const token = generateJwtToken(admin._id.toString());
		return res.status(200).json({
			message: 'Login successful',
			data: {
				id: admin._id,
				fullName: admin.fullName,
				email: admin.email,
				role: admin.role
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
			usage: 'Use this token in Authorization header to access admin login'
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.logout = async (req, res) => {
	try {
		// Get the admin ID from the authenticated request
		const adminId = req.auth.sub;
		
		// In a stateless JWT system, logout is typically handled client-side
		// by removing the token. However, we can log the logout event server-side
		// and potentially implement token blacklisting in the future
		
		// Log the logout event (you could save this to a database for audit purposes)
		console.log(`Admin logout: ${adminId} at ${new Date().toISOString()}`);
		
		return res.status(200).json({
			message: 'Logout successful',
			data: {
				adminId: adminId,
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
		
		// Find admin by email
		const admin = await Admin.findOne({ email });
		if (!admin) {
			// Don't reveal if email exists or not for security
			return res.status(200).json({
				message: 'If the email exists, a password reset link has been sent'
			});
		}
		
		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString('hex');
		const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
		
		// Save reset token to database
		admin.passwordResetToken = resetToken;
		admin.passwordResetExpires = resetTokenExpiry;
		await admin.save();
		
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
		
		// Find admin with valid reset token
		const admin = await Admin.findOne({
			passwordResetToken: token,
			passwordResetExpires: { $gt: Date.now() }
		});
		
		if (!admin) {
			return res.status(400).json({
				message: 'Invalid or expired reset token'
			});
		}
		
		// Hash new password
		const passwordHash = await Admin.hashPassword(newPassword);
		
		// Update password and clear reset token
		admin.passwordHash = passwordHash;
		admin.passwordResetToken = undefined;
		admin.passwordResetExpires = undefined;
		await admin.save();
		
		// Log password reset event
		console.log(`Admin password reset: ${admin.email} at ${new Date().toISOString()}`);
		
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
		const adminId = req.auth.sub;
		
		// Find admin
		const admin = await Admin.findById(adminId);
		if (!admin) {
			return res.status(404).json({ message: 'Admin not found' });
		}
		
		// Verify current password
		const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			return res.status(400).json({ message: 'Current password is incorrect' });
		}
		
		// Hash new password
		const passwordHash = await Admin.hashPassword(newPassword);
		
		// Update password
		admin.passwordHash = passwordHash;
		await admin.save();
		
		// Log password change event
		console.log(`Admin password changed: ${admin.email} at ${new Date().toISOString()}`);
		
		return res.status(200).json({
			message: 'Password changed successfully'
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.whoAmI = async (req, res) => {
	try {
		const adminId = req.auth.sub;
		
		// Find admin
		const admin = await Admin.findById(adminId);
		if (!admin) {
			return res.status(404).json({ 
				success: false,
				message: 'Admin not found' 
			});
		}
		
		// Check if admin is active
		if (!admin.isActive) {
			return res.status(403).json({ 
				success: false,
				message: 'Account is disabled' 
			});
		}
		
		return res.status(200).json({
			success: true,
			message: 'Admin profile retrieved successfully',
			data: {
				id: admin._id,
				fullName: admin.fullName,
				email: admin.email,
				role: admin.role,
				isActive: admin.isActive,
				created_at: admin.createdAt,
				updated_at: admin.updatedAt
			}
		});
	} catch (err) {
		console.error('Error fetching admin profile:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Internal server error' 
		});
	}
};