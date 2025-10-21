const jwt = require('jsonwebtoken');
const config = require('../config');

exports.requireAuth = (req, res, next) => {
	const authHeader = req.headers.authorization || '';
	
	// Check if Authorization header exists
	if (!authHeader) {
		return res.status(401).json({ 
			success: false,
			message: 'Authorization header is missing. Please provide: Authorization: Bearer <token>',
			data: null
		});
	}
	
	// Check if header starts with "Bearer "
	if (!authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ 
			success: false,
			message: 'Invalid authorization format. Use: Authorization: Bearer <token>',
			data: null
		});
	}
	
	const token = authHeader.slice(7);
	
	// Check if token exists after "Bearer "
	if (!token) {
		return res.status(401).json({ 
			success: false,
			message: 'Token is missing. Use: Authorization: Bearer <your_token_here>',
			data: null
		});
	}
	
	try {
		const payload = jwt.verify(token, config.jwts.secret);
		
		// Check if token has a valid role
		const validRoles = ['user', 'admin', 'super_admin'];
		if (!validRoles.includes(payload.role)) {
			return res.status(403).json({ 
				success: false,
				message: `Invalid user role: '${payload.role}'. Valid roles are: ${validRoles.join(', ')}`,
				data: null
			});
		}
		
		req.auth = payload;
		return next();
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			return res.status(401).json({ 
				success: false,
				message: 'Your token has expired. Please login again to get a new token.',
				data: null
			});
		} else if (err.name === 'JsonWebTokenError') {
			return res.status(401).json({ 
				success: false,
				message: 'Invalid token format. Please check your token and try again.',
				data: null
			});
		} else if (err.name === 'NotBeforeError') {
			return res.status(401).json({ 
				success: false,
				message: 'Token is not active yet. Please wait and try again.',
				data: null
			});
		} else {
			return res.status(401).json({ 
				success: false,
				message: `Token verification failed: ${err.message}`,
				data: null
			});
		}
	}
};
