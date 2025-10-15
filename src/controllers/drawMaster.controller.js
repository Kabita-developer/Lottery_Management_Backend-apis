const DrawMaster = require('../models/DrawMaster');

// Helper function to format selling rate as currency
const formatSellingRate = (rate) => {
	return new Intl.NumberFormat('en-IN', { 
		style: 'currency', 
		currency: 'INR' 
	}).format(rate);
};

// Create a new draw
exports.createDraw = async (req, res) => {
	try {
		const { drawTime, lastUnsoldTime, sellingRate } = req.body;
		
		// Debug logging
		console.log('Received data:', { drawTime, lastUnsoldTime, sellingRate });
		
		// Create new draw
		const draw = await DrawMaster.create({
			drawTime,
			lastUnsoldTime,
			sellingRate
		});
		
		// Debug logging after creation
		console.log('Created draw:', draw);
		
		return res.status(201).json({
			success: true,
			message: 'Draw created successfully',
			data: {
				id: draw._id,
				drawTime: draw.drawTime,
				lastUnsoldTime: draw.lastUnsoldTime,
				sellingRate: formatSellingRate(draw.sellingRate),
				createdAt: draw.createdAt,
				updatedAt: draw.updatedAt
			}
		});
	} catch (err) {
		console.error('Error creating draw:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Get all draws
exports.getAllDraws = async (req, res) => {
	try {
		const draws = await DrawMaster.find({})
			.sort({ createdAt: -1 })
			.select('-__v');
		
		// Return raw sellingRate without currency formatting and reorder fields
		const formattedDraws = draws.map(draw => {
			const drawObj = draw.toObject();
			return {
				_id: drawObj._id,
				drawTime: drawObj.drawTime,
				lastUnsoldTime: drawObj.lastUnsoldTime,
				sellingRate: drawObj.sellingRate,
				createdAt: drawObj.createdAt,
				updatedAt: drawObj.updatedAt
			};
		});
		
		return res.status(200).json({
			success: true,
			message: 'Draws retrieved successfully',
			data: {
				draws: formattedDraws,
				count: formattedDraws.length
			}
		});
	} catch (err) {
		console.error('Error fetching draws:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Get a single draw by ID
exports.getDrawById = async (req, res) => {
	try {
		const { id } = req.params;
		
		const draw = await DrawMaster.findById(id).select('-__v');
		
		if (!draw) {
			return res.status(404).json({
				success: false,
				message: 'Draw not found',
				data: null
			});
		}
		
		// Return raw sellingRate without currency formatting
		const formattedDraw = {
			...draw.toObject()
		};
		
		return res.status(200).json({
			success: true,
			message: 'Draw retrieved successfully',
			data: formattedDraw
		});
	} catch (err) {
		console.error('Error fetching draw:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Update a draw
exports.updateDraw = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = req.body;
		
		const draw = await DrawMaster.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		).select('-__v');
		
		if (!draw) {
			return res.status(404).json({
				success: false,
				message: 'Draw not found',
				data: null
			});
		}
		
		return res.status(200).json({
			success: true,
			message: 'Draw updated successfully',
			data: {
				id: draw._id,
				drawTime: draw.drawTime,
				lastUnsoldTime: draw.lastUnsoldTime,
				sellingRate: draw.sellingRate,
				createdAt: draw.createdAt,
				updatedAt: draw.updatedAt
			}
		});
	} catch (err) {
		console.error('Error updating draw:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Delete a draw
exports.deleteDraw = async (req, res) => {
	try {
		const { id } = req.params;
		
		const draw = await DrawMaster.findByIdAndDelete(id);
		
		if (!draw) {
			return res.status(404).json({
				success: false,
				message: 'Draw not found',
				data: null
			});
		}
		
		return res.status(200).json({
			success: true,
			message: 'Draw deleted successfully',
			data: {
				id: draw._id,
				drawTime: draw.drawTime,
				lastUnsoldTime: draw.lastUnsoldTime,
				sellingRate: draw.sellingRate,
				deletedAt: new Date().toISOString()
			}
		});
	} catch (err) {
		console.error('Error deleting draw:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};
