const jwt = require('jsonwebtoken');
const config = require('../config');

exports.requireUser = (req, res, next) => {
	const authHeader = req.headers.authorization || '';
	
	// Check if Authorization header exists
	if (!authHeader) {
		return res.status(401).json({ 
			message: 'Authorization header is missing. Please provide: Authorization: Bearer <token>' 
		});
	}
	
	// Check if header starts with "Bearer "
	if (!authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ 
			message: 'Invalid authorization format. Use: Authorization: Bearer <token>' 
		});
	}
	
	const token = authHeader.slice(7);
	
	// Check if token exists after "Bearer "
	if (!token) {
		return res.status(401).json({ 
			message: 'Token is missing. Use: Authorization: Bearer <your_token_here>' 
		});
	}
	
	try {
		const payload = jwt.verify(token, config.jwts.secret);
		
		// Check if token has the correct role
		if (payload.role !== 'user') {
			return res.status(403).json({ 
				message: `Access denied. This endpoint requires user role, but your token has role: '${payload.role}'. Please use a user token.` 
			});
		}
		
		req.auth = payload;
		return next();
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			return res.status(401).json({ 
				message: 'Your token has expired. Please login again to get a new token.' 
			});
		} else if (err.name === 'JsonWebTokenError') {
			return res.status(401).json({ 
				message: 'Invalid token format. Please check your token and try again.' 
			});
		} else if (err.name === 'NotBeforeError') {
			return res.status(401).json({ 
				message: 'Token is not active yet. Please wait and try again.' 
			});
		} else {
			return res.status(401).json({ 
				message: 'Token verification failed. Please check your token and try again.' 
			});
		}
	}
};
