const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

// Middleware
app.use(express.json());

// Simple JWT verification middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false,
            message: 'Authorization header is missing. Please provide: Authorization: Bearer <token>',
            data: null
        });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false,
            message: 'Invalid authorization format. Use: Authorization: Bearer <token>',
            data: null
        });
    }
    
    const token = authHeader.slice(7);
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token is missing. Use: Authorization: Bearer <your_token_here>',
            data: null
        });
    }
    
    try {
        // Use a simple secret for testing
        const payload = jwt.verify(token, 'your-secret-key');
        
        if (payload.role !== 'super_admin') {
            return res.status(403).json({ 
                success: false,
                message: `Access denied. This endpoint requires super_admin role, but your token has role: '${payload.role}'. Please use a super admin token.`,
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
        } else {
            return res.status(401).json({ 
                success: false,
                message: `Token verification failed: ${err.message}`,
                data: null
            });
        }
    }
};

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Test endpoint without auth
app.post('/api/same-master/test-generate-combinations', (req, res) => {
    try {
        const { same_number, series_numbers, letters } = req.body;
        
        // Basic validation
        if (!same_number || !series_numbers || !letters) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: same_number, series_numbers, letters',
                data: null
            });
        }
        
        // Validate letters format
        if (!/^[A-Z]+$/.test(letters)) {
            return res.status(400).json({
                success: false,
                message: 'Letters must contain only uppercase letters (A-Z)',
                data: null
            });
        }
        
        // Parse series numbers
        let series;
        try {
            if (series_numbers.startsWith('[') && series_numbers.endsWith(']')) {
                series = JSON.parse(series_numbers);
            } else {
                series = series_numbers.split(',').map(n => n.trim()).filter(n => n);
            }
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: 'Invalid series_numbers format. Use comma-separated numbers or JSON array',
                data: null
            });
        }
        
        if (series.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid series numbers found',
                data: null
            });
        }
        
        // Generate combinations
        const letterArray = letters.split('');
        const combinations = [];
        
        series.forEach(seriesNum => {
            const seriesCombinations = [];
            letterArray.forEach(letter => {
                seriesCombinations.push(`${seriesNum}${letter}`);
            });
            combinations.push(seriesCombinations.join(','));
        });
        
        const result = {
            same_number: same_number,
            series_numbers: series_numbers,
            letters: letters,
            combinations: combinations,
            total_combinations: combinations.length * letterArray.length
        };
        
        return res.status(200).json({
            success: true,
            message: 'Combinations generated successfully',
            data: result
        });
    } catch (err) {
        console.error('Error generating combinations:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: {
                error: err.message
            }
        });
    }
});

// Main endpoint with auth
app.post('/api/same-master/generate-combinations', verifyToken, (req, res) => {
    try {
        const { same_number, series_numbers, letters } = req.body;
        
        // Basic validation
        if (!same_number || !series_numbers || !letters) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: same_number, series_numbers, letters',
                data: null
            });
        }
        
        // Validate letters format
        if (!/^[A-Z]+$/.test(letters)) {
            return res.status(400).json({
                success: false,
                message: 'Letters must contain only uppercase letters (A-Z)',
                data: null
            });
        }
        
        // Parse series numbers
        let series;
        try {
            if (series_numbers.startsWith('[') && series_numbers.endsWith(']')) {
                series = JSON.parse(series_numbers);
            } else {
                series = series_numbers.split(',').map(n => n.trim()).filter(n => n);
            }
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: 'Invalid series_numbers format. Use comma-separated numbers or JSON array',
                data: null
            });
        }
        
        if (series.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid series numbers found',
                data: null
            });
        }
        
        // Generate combinations
        const letterArray = letters.split('');
        const combinations = [];
        
        series.forEach(seriesNum => {
            const seriesCombinations = [];
            letterArray.forEach(letter => {
                seriesCombinations.push(`${seriesNum}${letter}`);
            });
            combinations.push(seriesCombinations.join(','));
        });
        
        const result = {
            same_number: same_number,
            series_numbers: series_numbers,
            letters: letters,
            combinations: combinations,
            total_combinations: combinations.length * letterArray.length
        };
        
        return res.status(200).json({
            success: true,
            message: 'Combinations generated successfully',
            data: result
        });
    } catch (err) {
        console.error('Error generating combinations:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: {
                error: err.message
            }
        });
    }
});

// Create a test token endpoint
app.get('/api/create-test-token', (req, res) => {
    const token = jwt.sign(
        { 
            sub: 'test-user-id', 
            role: 'super_admin',
            email: 'test@example.com'
        },
        'your-secret-key',
        { expiresIn: '7d' }
    );
    
    res.json({
        success: true,
        message: 'Test token created',
        data: {
            token: token
        }
    });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Working API server running on port ${PORT}`);
    console.log('Test endpoints:');
    console.log('1. GET http://localhost:3002/api/create-test-token (to get a test token)');
    console.log('2. POST http://localhost:3002/api/same-master/test-generate-combinations (no auth)');
    console.log('3. POST http://localhost:3002/api/same-master/generate-combinations (with auth)');
});
