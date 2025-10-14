const jwt = require('jsonwebtoken');
const config = require('../config');

exports.requireSuperAdminPreAuth = (req, res, next) => {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	
	if (!token) {
		return res.status(401).json({ 
			message: 'Super admin pre-authentication required. Please provide a valid JWT token.' 
		});
	}
	
	try {
		const payload = jwt.verify(token, config.jwts.secret);
		
		// Check if the token has super_admin role or is a special pre-auth token
		if (payload.role !== 'super_admin' && payload.role !== 'super_admin_pre_auth') {
			return res.status(403).json({ 
				message: 'Invalid token role. Super admin pre-authentication required.' 
			});
		}
		
		req.preAuth = payload;
		return next();
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'JWT pre-auth token has expired' });
		} else if (err.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'JWT pre-auth token is invalid' });
		} else if (err.name === 'NotBeforeError') {
			return res.status(401).json({ message: 'JWT pre-auth token not active' });
		} else {
			return res.status(401).json({ message: 'JWT pre-auth token is invalid' });
		}
	}
};
