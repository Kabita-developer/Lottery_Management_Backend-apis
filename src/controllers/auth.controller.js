const User = require('../models/User');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');

// Central Who Am I function that works for all user types
exports.whoAmI = async (req, res) => {
	try {
		const userId = req.auth.sub;
		const userRole = req.auth.role;
		const tokenIssuedAt = req.auth.iat;
		const tokenExpiresAt = req.auth.exp;
		
		let user = null;
		let userData = null;
		
		// Find user based on role
		switch (userRole) {
			case 'user':
				user = await User.findById(userId);
				if (user) {
					userData = {
						id: user._id,
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
						address: user.address,
						phone: user.phone,
						role: user.role,
						isActive: user.isActive,
						created_at: user.createdAt,
						updated_at: user.updatedAt
					};
				}
				break;
				
			case 'admin':
				user = await Admin.findById(userId);
				if (user) {
					userData = {
						id: user._id,
						fullName: user.fullName,
						email: user.email,
						role: user.role,
						isActive: user.isActive,
						created_at: user.createdAt,
						updated_at: user.updatedAt
					};
				}
				break;
				
			case 'super_admin':
				user = await SuperAdmin.findById(userId);
				if (user) {
					userData = {
						id: user._id,
						fullName: user.fullName,
						email: user.email,
						role: user.role,
						isActive: user.isActive,
						created_at: user.createdAt,
						updated_at: user.updatedAt
					};
				}
				break;
				
			default:
				return res.status(400).json({
					success: false,
					message: 'Invalid user role'
				});
		}
		
		// Check if user exists
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}
		
		// Check if user is active
		if (!user.isActive) {
			return res.status(403).json({
				success: false,
				message: 'Account is disabled'
			});
		}
		
		// Calculate token expiration information
		const currentTime = Math.floor(Date.now() / 1000);
		const timeUntilExpiry = tokenExpiresAt - currentTime;
		const isExpired = timeUntilExpiry <= 0;
		const isExpiringSoon = timeUntilExpiry <= 3600; // 1 hour
		
		// Format dates for better readability
		const tokenIssuedDate = new Date(tokenIssuedAt * 1000).toISOString();
		const tokenExpiresDate = new Date(tokenExpiresAt * 1000).toISOString();
		
		// Return appropriate response based on role
		let message = '';
		switch (userRole) {
			case 'user':
				message = 'User profile retrieved successfully';
				break;
			case 'admin':
				message = 'Admin profile retrieved successfully';
				break;
			case 'super_admin':
				message = 'Super admin profile retrieved successfully';
				break;
		}
		
		return res.status(200).json({
			success: true,
			message: message,
			data: {
				...userData,
				token: {
					issued_at: tokenIssuedDate,
					expires_at: tokenExpiresDate,
					expires_in_seconds: timeUntilExpiry,
					expires_in_hours: Math.floor(timeUntilExpiry / 3600),
					expires_in_days: Math.floor(timeUntilExpiry / 86400),
					is_expired: isExpired,
					is_expiring_soon: isExpiringSoon,
					status: isExpired ? 'expired' : isExpiringSoon ? 'expiring_soon' : 'valid'
				}
			}
		});
		
	} catch (err) {
		console.error('Error fetching user profile:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error'
		});
	}
};
