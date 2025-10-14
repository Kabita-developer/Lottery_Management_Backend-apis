const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const config = require('../config');

function generateJwtToken(userId) {
	const payload = { sub: userId, role: 'user' };
	return jwt.sign(payload, config.jwts.secret, { expiresIn: config.jwts.expiresIn });
}

exports.signup = async (req, res) => {
	try {
		const { firstName, lastName, email, address, phone, password } = req.body;
		
		// Check if user already exists
		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: 'Email already registered' });
		}
		
		// Hash password
		const passwordHash = await User.hashPassword(password);
		
		// Create user
		const user = await User.create({
			firstName,
			lastName,
			email,
			address,
			phone,
			passwordHash
		});
		
		// Generate JWT token
		const token = generateJwtToken(user._id.toString());
		
		return res.status(201).json({
			message: 'User created successfully',
			data: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				address: user.address,
				phone: user.phone,
				role: user.role
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
		
		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		
		// Verify password
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		
		// Check if user is active
		if (!user.isActive) {
			return res.status(403).json({ message: 'Account disabled' });
		}
		
		// Generate JWT token
		const token = generateJwtToken(user._id.toString());
		
		return res.status(200).json({
			message: 'Login successful',
			data: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				address: user.address,
				phone: user.phone,
				role: user.role
			},
			token
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};

exports.logout = async (req, res) => {
	try {
		// Get the user ID from the authenticated request
		const userId = req.auth.sub;
		
		// In a stateless JWT system, logout is typically handled client-side
		// by removing the token. However, we can log the logout event server-side
		// and potentially implement token blacklisting in the future
		
		// Log the logout event (you could save this to a database for audit purposes)
		console.log(`User logout: ${userId} at ${new Date().toISOString()}`);
		
		return res.status(200).json({
			message: 'Logout successful',
			data: {
				userId: userId,
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
		
		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			// Don't reveal if email exists or not for security
			return res.status(200).json({
				message: 'If the email exists, a password reset link has been sent'
			});
		}
		
		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString('hex');
		const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
		
		// Save reset token to database
		user.passwordResetToken = resetToken;
		user.passwordResetExpires = resetTokenExpiry;
		await user.save();
		
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
		
		// Find user with valid reset token
		const user = await User.findOne({
			passwordResetToken: token,
			passwordResetExpires: { $gt: Date.now() }
		});
		
		if (!user) {
			return res.status(400).json({
				message: 'Invalid or expired reset token'
			});
		}
		
		// Hash new password
		const passwordHash = await User.hashPassword(newPassword);
		
		// Update password and clear reset token
		user.passwordHash = passwordHash;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save();
		
		// Log password reset event
		console.log(`User password reset: ${user.email} at ${new Date().toISOString()}`);
		
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
		const userId = req.auth.sub;
		
		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		
		// Verify current password
		const isCurrentPasswordValid = await user.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			return res.status(400).json({ message: 'Current password is incorrect' });
		}
		
		// Hash new password
		const passwordHash = await User.hashPassword(newPassword);
		
		// Update password
		user.passwordHash = passwordHash;
		await user.save();
		
		// Log password change event
		console.log(`User password changed: ${user.email} at ${new Date().toISOString()}`);
		
		return res.status(200).json({
			message: 'Password changed successfully'
		});
	} catch (err) {
		return res.status(500).json({ message: 'Internal server error' });
	}
};
