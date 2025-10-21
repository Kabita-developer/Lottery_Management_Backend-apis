const Stockist = require('../models/Stockist');

// Create a new stockist
exports.createStockist = async (req, res) => {
	try {
		const {
			code,
			name,
			aadharId,
			aadharName,
			address1,
			address2,
			pinCode,
			phone,
			email,
			panNo,
			type,
			device,
			active,
			isSeller,
			allowMail
		} = req.body;

		const createdBy = req.auth.sub; // Admin ID from JWT

		// Check for duplicate code
		const existingCode = await Stockist.findOne({ code });
		if (existingCode) {
			return res.status(409).json({
				success: false,
				message: 'Stockist with this code already exists',
				data: {
					error: 'DUPLICATE_CODE',
					field: 'code',
					value: code
				}
			});
		}

		// Check for duplicate email
		const existingEmail = await Stockist.findOne({ email });
		if (existingEmail) {
			return res.status(409).json({
				success: false,
				message: 'Stockist with this email already exists',
				data: {
					error: 'DUPLICATE_EMAIL',
					field: 'email',
					value: email
				}
			});
		}

		// Check for duplicate Aadhar ID
		const existingAadhar = await Stockist.findOne({ aadharId });
		if (existingAadhar) {
			return res.status(409).json({
				success: false,
				message: 'Stockist with this Aadhar ID already exists',
				data: {
					error: 'DUPLICATE_AADHAR',
					field: 'aadharId',
					value: aadharId
				}
			});
		}

		// Check for duplicate PAN
		const existingPAN = await Stockist.findOne({ panNo });
		if (existingPAN) {
			return res.status(409).json({
				success: false,
				message: 'Stockist with this PAN number already exists',
				data: {
					error: 'DUPLICATE_PAN',
					field: 'panNo',
					value: panNo
				}
			});
		}

		const stockist = await Stockist.create({
			code,
			name,
			aadharId,
			aadharName,
			address1,
			address2,
			pinCode,
			phone,
			email,
			panNo,
			type,
			device,
			active: active !== undefined ? active : true,
			isSeller: isSeller !== undefined ? isSeller : false,
			allowMail: allowMail !== undefined ? allowMail : true,
			created_by: createdBy
		});

		return res.status(201).json({
			success: true,
			message: 'Stockist created successfully',
			data: {
				id: stockist._id,
				code: stockist.code,
				name: stockist.name,
				aadharId: stockist.aadharId,
				aadharName: stockist.aadharName,
				address1: stockist.address1,
				address2: stockist.address2,
				pinCode: stockist.pinCode,
				phone: stockist.phone,
				email: stockist.email,
				panNo: stockist.panNo,
				type: stockist.type,
				device: stockist.device,
				active: stockist.active,
				isSeller: stockist.isSeller,
				allowMail: stockist.allowMail,
				created_by: stockist.created_by,
				created_at: stockist.createdAt,
				updated_at: stockist.updatedAt
			}
		});
	} catch (err) {
		console.error('Error creating stockist:', err);
		
		// Handle specific MongoDB errors
		if (err.name === 'ValidationError') {
			const validationErrors = Object.values(err.errors).map(error => ({
				field: error.path,
				message: error.message,
				value: error.value
			}));
			
			return res.status(400).json({
				success: false,
				message: 'Validation failed',
				data: {
					error: 'VALIDATION_ERROR',
					errors: validationErrors
				}
			});
		}
		
		if (err.code === 11000) {
			// Duplicate key error
			const field = Object.keys(err.keyPattern)[0];
			return res.status(409).json({
				success: false,
				message: `Duplicate value for field: ${field}`,
				data: {
					error: 'DUPLICATE_KEY',
					field: field,
					value: err.keyValue[field]
				}
			});
		}
		
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: {
				error: 'INTERNAL_SERVER_ERROR',
				details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
			}
		});
	}
};

// Get all stockists with pagination and filters
exports.getAllStockists = async (req, res) => {
	try {
		const { 
			page = 1, 
			limit = 10, 
			search, 
			type, 
			active, 
			isSeller, 
			allowMail 
		} = req.query;

		const numericPage = Math.max(1, parseInt(page));
		const numericLimit = Math.min(100, Math.max(1, parseInt(limit)));
		const skip = (numericPage - 1) * numericLimit;

		// Build filter
		const filter = {};
		
		if (type && ['Credit Party', 'Debit Party'].includes(type)) {
			filter.type = type;
		}
		
		if (active !== undefined) {
			filter.active = active === 'true';
		}
		
		if (isSeller !== undefined) {
			filter.isSeller = isSeller === 'true';
		}
		
		if (allowMail !== undefined) {
			filter.allowMail = allowMail === 'true';
		}
		
		if (search && search.trim()) {
			const searchTerm = search.trim();
			filter.$or = [
				{ code: { $regex: searchTerm, $options: 'i' } },
				{ name: { $regex: searchTerm, $options: 'i' } },
				{ aadharName: { $regex: searchTerm, $options: 'i' } },
				{ email: { $regex: searchTerm, $options: 'i' } },
				{ phone: { $regex: searchTerm, $options: 'i' } },
				{ panNo: { $regex: searchTerm, $options: 'i' } }
			];
		}

		const [stockists, total] = await Promise.all([
			Stockist.find(filter)
				.sort({ created_at: -1 })
				.skip(skip)
				.limit(numericLimit)
				.populate('created_by', 'fullName email')
				.select('-__v'),
			Stockist.countDocuments(filter)
		]);

		const data = stockists.map(stockist => ({
			id: stockist._id,
			code: stockist.code,
			name: stockist.name,
			aadharId: stockist.aadharId,
			aadharName: stockist.aadharName,
			address1: stockist.address1,
			address2: stockist.address2,
			pinCode: stockist.pinCode,
			phone: stockist.phone,
			email: stockist.email,
			panNo: stockist.panNo,
			type: stockist.type,
			device: stockist.device,
			active: stockist.active,
			isSeller: stockist.isSeller,
			allowMail: stockist.allowMail,
			created_by: stockist.created_by,
			created_at: stockist.createdAt,
			updated_at: stockist.updatedAt
		}));

		return res.status(200).json({
			success: true,
			message: 'Stockists retrieved successfully',
			data: {
				stockists: data,
				pagination: {
					current_page: numericPage,
					total_pages: Math.ceil(total / numericLimit),
					total_records: total,
					limit: numericLimit
				}
			}
		});
	} catch (err) {
		console.error('Error fetching stockists:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Get stockist by ID
exports.getStockistById = async (req, res) => {
	try {
		const { id } = req.params;

		const stockist = await Stockist.findById(id)
			.populate('created_by', 'fullName email')
			.select('-__v');

		if (!stockist) {
			return res.status(404).json({
				success: false,
				message: 'Stockist not found',
				data: null
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Stockist retrieved successfully',
			data: {
				id: stockist._id,
				code: stockist.code,
				name: stockist.name,
				aadharId: stockist.aadharId,
				aadharName: stockist.aadharName,
				address1: stockist.address1,
				address2: stockist.address2,
				pinCode: stockist.pinCode,
				phone: stockist.phone,
				email: stockist.email,
				panNo: stockist.panNo,
				type: stockist.type,
				device: stockist.device,
				active: stockist.active,
				isSeller: stockist.isSeller,
				allowMail: stockist.allowMail,
				created_by: stockist.created_by,
				created_at: stockist.createdAt,
				updated_at: stockist.updatedAt
			}
		});
	} catch (err) {
		console.error('Error fetching stockist by id:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Update stockist
exports.updateStockist = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		// Remove fields that shouldn't be updated
		delete updateData.created_by;
		delete updateData.created_at;
		delete updateData.updated_at;

		// Check for duplicate code if code is being updated
		if (updateData.code) {
			const existingCode = await Stockist.findOne({ 
				code: updateData.code, 
				_id: { $ne: id } 
			});
			if (existingCode) {
				return res.status(409).json({
					success: false,
					message: 'Stockist with this code already exists',
					data: {
						error: 'DUPLICATE_CODE',
						field: 'code',
						value: updateData.code
					}
				});
			}
		}

		// Check for duplicate email if email is being updated
		if (updateData.email) {
			const existingEmail = await Stockist.findOne({ 
				email: updateData.email, 
				_id: { $ne: id } 
			});
			if (existingEmail) {
				return res.status(409).json({
					success: false,
					message: 'Stockist with this email already exists',
					data: {
						error: 'DUPLICATE_EMAIL',
						field: 'email',
						value: updateData.email
					}
				});
			}
		}

		// Check for duplicate Aadhar ID if aadharId is being updated
		if (updateData.aadharId) {
			const existingAadhar = await Stockist.findOne({ 
				aadharId: updateData.aadharId, 
				_id: { $ne: id } 
			});
			if (existingAadhar) {
				return res.status(409).json({
					success: false,
					message: 'Stockist with this Aadhar ID already exists',
					data: {
						error: 'DUPLICATE_AADHAR',
						field: 'aadharId',
						value: updateData.aadharId
					}
				});
			}
		}

		// Check for duplicate PAN if panNo is being updated
		if (updateData.panNo) {
			const existingPAN = await Stockist.findOne({ 
				panNo: updateData.panNo, 
				_id: { $ne: id } 
			});
			if (existingPAN) {
				return res.status(409).json({
					success: false,
					message: 'Stockist with this PAN number already exists',
					data: {
						error: 'DUPLICATE_PAN',
						field: 'panNo',
						value: updateData.panNo
					}
				});
			}
		}

		const stockist = await Stockist.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		).populate('created_by', 'fullName email').select('-__v');

		if (!stockist) {
			return res.status(404).json({
				success: false,
				message: 'Stockist not found',
				data: null
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Stockist updated successfully',
			data: {
				id: stockist._id,
				code: stockist.code,
				name: stockist.name,
				aadharId: stockist.aadharId,
				aadharName: stockist.aadharName,
				address1: stockist.address1,
				address2: stockist.address2,
				pinCode: stockist.pinCode,
				phone: stockist.phone,
				email: stockist.email,
				panNo: stockist.panNo,
				type: stockist.type,
				device: stockist.device,
				active: stockist.active,
				isSeller: stockist.isSeller,
				allowMail: stockist.allowMail,
				created_by: stockist.created_by,
				created_at: stockist.createdAt,
				updated_at: stockist.updatedAt
			}
		});
	} catch (err) {
		console.error('Error updating stockist:', err);
		
		if (err.name === 'ValidationError') {
			const validationErrors = Object.values(err.errors).map(error => ({
				field: error.path,
				message: error.message,
				value: error.value
			}));
			
			return res.status(400).json({
				success: false,
				message: 'Validation failed',
				data: {
					error: 'VALIDATION_ERROR',
					errors: validationErrors
				}
			});
		}
		
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: {
				error: 'INTERNAL_SERVER_ERROR',
				details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
			}
		});
	}
};

// Delete stockist
exports.deleteStockist = async (req, res) => {
	try {
		const { id } = req.params;

		const stockist = await Stockist.findByIdAndDelete(id);

		if (!stockist) {
			return res.status(404).json({
				success: false,
				message: 'Stockist not found',
				data: null
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Stockist deleted successfully',
			data: {
				id: stockist._id,
				code: stockist.code,
				name: stockist.name,
				deleted_at: new Date().toISOString()
			}
		});
	} catch (err) {
		console.error('Error deleting stockist:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Toggle stockist active status
exports.toggleStockistStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { active } = req.body;

		const stockist = await Stockist.findByIdAndUpdate(
			id,
			{ active: active },
			{ new: true, runValidators: true }
		).select('-__v');

		if (!stockist) {
			return res.status(404).json({
				success: false,
				message: 'Stockist not found',
				data: null
			});
		}

		return res.status(200).json({
			success: true,
			message: `Stockist ${active ? 'activated' : 'deactivated'} successfully`,
			data: {
				id: stockist._id,
				code: stockist.code,
				name: stockist.name,
				active: stockist.active,
				updated_at: stockist.updatedAt
			}
		});
	} catch (err) {
		console.error('Error toggling stockist status:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};
