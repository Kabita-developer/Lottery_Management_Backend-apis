const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
	return res.status(200).json({ status: 'ok' });
});

// Mount routes (no version prefix)
app.use('/api', require('./src/routes'));

// Static docs
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Global error handler
app.use((err, req, res, next) => {
	console.error('Global error handler caught error:', err);
	console.error('Error stack:', err.stack);
	console.error('Request URL:', req.url);
	console.error('Request method:', req.method);
	console.error('Request body:', req.body);
	
	res.status(500).json({
		success: false,
		message: 'Internal server error',
		data: {
			error: err.message,
			stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
		}
	});
});

// Connect DB and start server
const PORT = config.port;
const MONGO_URI = config.mongoUri;

mongoose
	.connect(MONGO_URI)
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB', err);
		process.exit(1);
	});

module.exports = app;
