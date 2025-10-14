const SameMaster = require('../models/SameMaster');
const SameMasterAudit = require('../models/SameMasterAudit');
const matchingEngine = require('../services/matchingEngine');
const combinationGenerator = require('../services/combinationGenerator');

// Test combinationGenerator import
console.log('combinationGenerator imported:', typeof combinationGenerator);
console.log('combinationGenerator methods:', Object.getOwnPropertyNames(combinationGenerator));
console.log('generateCombinations method:', typeof combinationGenerator.generateCombinations);

// Create a new same master rule
exports.createSameMaster = async (req, res) => {
	try {
		const { same_number, page_logic, page_logic_details, series_numbers, page_no_logic, is_active, priority } = req.body;
		const createdBy = req.auth.sub; // Super Admin ID from JWT
		
		// Create new same master rule
		const sameMaster = await SameMaster.create({
			same_number,
			page_logic,
			page_logic_details,
			series_numbers,
			page_no_logic,
			is_active,
			priority,
			created_by: createdBy
		});
		
		return res.status(201).json({
			success: true,
			message: 'Same Master rule created successfully',
			data: {
				id: sameMaster._id,
				same_number: sameMaster.same_number,
				page_logic: sameMaster.page_logic,
				series_numbers: sameMaster.series_numbers,
				page_no_logic: sameMaster.page_no_logic,
				is_active: sameMaster.is_active,
				priority: sameMaster.priority,
				created_by: sameMaster.created_by,
				createdAt: sameMaster.createdAt,
				updatedAt: sameMaster.updatedAt
			}
		});
	} catch (err) {
		console.error('Error creating same master rule:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Get all same master rules
exports.getAllSameMaster = async (req, res) => {
	try {
		const { page = 1, limit = 10, is_active, page_logic } = req.query;
		const skip = (page - 1) * limit;
		
		// Build filter
		const filter = {};
		if (is_active !== undefined) {
			filter.is_active = is_active === 'true';
		}
		if (page_logic) {
			filter.page_logic = page_logic;
		}
		
		const sameMasterRules = await SameMaster.find(filter)
			.sort({ priority: -1, created_at: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.populate('created_by', 'fullName email')
			.select('-__v');
		
		const total = await SameMaster.countDocuments(filter);
		
		// Transform page_logic values for response
		const transformedRules = sameMasterRules.map(rule => {
			const ruleObj = rule.toObject();
			// Transform page_logic: "WITHOUT_PAGE_LOGIC" -> "no", "WITH_PAGE_LOGIC" -> "yes"
			if (ruleObj.page_logic === 'WITHOUT_PAGE_LOGIC') {
				ruleObj.page_logic = 'no';
			} else if (ruleObj.page_logic === 'WITH_PAGE_LOGIC') {
				ruleObj.page_logic = 'yes';
			}
			return ruleObj;
		});
		
		return res.status(200).json({
			success: true,
			message: 'Same Master rules retrieved successfully',
			data: {
				rules: transformedRules,
				pagination: {
					current_page: parseInt(page),
					total_pages: Math.ceil(total / limit),
					total_records: total,
					limit: parseInt(limit)
				}
			}
		});
	} catch (err) {
		console.error('Error fetching same master rules:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Get a single same master rule by ID
exports.getSameMasterById = async (req, res) => {
	try {
		const { id } = req.params;
		
		const sameMaster = await SameMaster.findById(id)
			.populate('created_by', 'fullName email')
			.select('-__v');
		
		if (!sameMaster) {
			return res.status(404).json({
				success: false,
				message: 'Same Master rule not found',
				data: null
			});
		}
		
		// Transform page_logic value for response
		const ruleObj = sameMaster.toObject();
		if (ruleObj.page_logic === 'WITHOUT_PAGE_LOGIC') {
			ruleObj.page_logic = 'no';
		} else if (ruleObj.page_logic === 'WITH_PAGE_LOGIC') {
			ruleObj.page_logic = 'yes';
		}
		
		return res.status(200).json({
			success: true,
			message: 'Same Master rule retrieved successfully',
			data: ruleObj
		});
	} catch (err) {
		console.error('Error fetching same master rule:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Update a same master rule
exports.updateSameMaster = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = req.body;
		
		const sameMaster = await SameMaster.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		).select('-__v');
		
		if (!sameMaster) {
			return res.status(404).json({
				success: false,
				message: 'Same Master rule not found',
				data: null
			});
		}
		
		// Transform page_logic value for response
		let transformedPageLogic = sameMaster.page_logic;
		if (sameMaster.page_logic === 'WITHOUT_PAGE_LOGIC') {
			transformedPageLogic = 'no';
		} else if (sameMaster.page_logic === 'WITH_PAGE_LOGIC') {
			transformedPageLogic = 'yes';
		}
		
		return res.status(200).json({
			success: true,
			message: 'Same Master rule updated successfully',
			data: {
				id: sameMaster._id,
				same_number: sameMaster.same_number,
				page_logic: transformedPageLogic,
				series_numbers: sameMaster.series_numbers,
				page_no_logic: sameMaster.page_no_logic,
				is_active: sameMaster.is_active,
				priority: sameMaster.priority,
				created_by: sameMaster.created_by,
				createdAt: sameMaster.createdAt,
				updatedAt: sameMaster.updatedAt
			}
		});
	} catch (err) {
		console.error('Error updating same master rule:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Soft delete a same master rule (set is_active to false)
exports.deleteSameMaster = async (req, res) => {
	try {
		const { id } = req.params;
		
		const sameMaster = await SameMaster.findByIdAndUpdate(
			id,
			{ is_active: false },
			{ new: true }
		).select('-__v');
		
		if (!sameMaster) {
			return res.status(404).json({
				success: false,
				message: 'Same Master rule not found',
				data: null
			});
		}
		
		return res.status(200).json({
			success: true,
			message: 'Same Master rule deactivated successfully',
			data: {
				id: sameMaster._id,
				same_number: sameMaster.same_number,
				is_active: sameMaster.is_active,
				deactivatedAt: new Date().toISOString()
			}
		});
	} catch (err) {
		console.error('Error deactivating same master rule:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Match tickets against rules
exports.matchTickets = async (req, res) => {
	try {
		const { tickets } = req.body;
		const executedBy = req.auth.sub; // Super Admin ID from JWT
		
		const result = await matchingEngine.matchTickets(tickets, executedBy);
		
		return res.status(200).json({
			success: true,
			message: 'Ticket matching completed successfully',
			data: result
		});
	} catch (err) {
		console.error('Error matching tickets:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};

// Generate ticket combinations
exports.generateCombinations = async (req, res) => {
    try {
        console.log('=== [SameMaster] generateCombinations called ===');
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Body:', JSON.stringify(req.body, null, 2));

        const { same_number, series_numbers, letters } = req.body || {};

        // 1) Presence validation
        const missingFields = [];
        if (same_number === undefined || same_number === null || `${same_number}`.trim() === '') missingFields.push('same_number');
        if (series_numbers === undefined || series_numbers === null || `${series_numbers}`.length === 0) missingFields.push('series_numbers');
        if (letters === undefined || letters === null || `${letters}`.length === 0) missingFields.push('letters');
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
                data: { missingFields }
            });
        }

        // 2) Parse same_number to number (safe)
        const sameNumberParsed = Number(String(same_number).trim());
        if (!Number.isFinite(sameNumberParsed)) {
            return res.status(400).json({
                success: false,
                message: 'same_number must be a valid number',
                data: { received: same_number }
            });
        }

        // 3) Parse series_numbers: supports CSV string, JSON-like string, or array
        let seriesArrayRaw;
        if (Array.isArray(series_numbers)) {
            seriesArrayRaw = series_numbers;
        } else if (typeof series_numbers === 'string') {
            const trimmed = series_numbers.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    seriesArrayRaw = JSON.parse(trimmed);
                } catch (e) {
                    return res.status(400).json({
                        success: false,
                        message: 'series_numbers JSON is invalid',
                        data: { received: series_numbers, error: e.message }
                    });
                }
            } else {
                seriesArrayRaw = trimmed.split(',').map(s => s.trim()).filter(Boolean);
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'series_numbers must be a CSV string or an array of numbers',
                data: { receivedType: typeof series_numbers }
            });
        }

        // Normalize series to string numbers and validate
        const series = seriesArrayRaw.map(v => String(v).trim()).filter(Boolean);
        if (series.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid series numbers found', data: { received: series_numbers } });
        }
        if (!series.every(s => /^\d+$/.test(s))) {
            return res.status(400).json({
                success: false,
                message: 'series_numbers must contain only numeric values',
                data: { parsed: series }
            });
        }

        // 4) Parse letters: supports single string (e.g., "ABCDE"), CSV string ("A,B,C"), or array(["A","B"]) 
        let lettersArrayRaw;
        if (Array.isArray(letters)) {
            lettersArrayRaw = letters;
        } else if (typeof letters === 'string') {
            const ltrim = letters.trim();
            if (ltrim.includes(',')) {
                lettersArrayRaw = ltrim.split(',').map(s => s.trim()).filter(Boolean);
            } else if (ltrim.startsWith('[') && ltrim.endsWith(']')) {
                try {
                    const parsedLetters = JSON.parse(ltrim);
                    lettersArrayRaw = Array.isArray(parsedLetters) ? parsedLetters : [ltrim];
                } catch (_) {
                    // Fallback to characters
                    lettersArrayRaw = ltrim.split('');
                }
            } else {
                lettersArrayRaw = ltrim.split('');
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'letters must be a string or an array',
                data: { receivedType: typeof letters }
            });
        }

        // Normalize letters to single uppercase A-Z
        const lettersArray = lettersArrayRaw.map(ch => String(ch).trim().toUpperCase()).filter(Boolean);
        if (lettersArray.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid letters provided', data: { received: letters } });
        }
        if (!lettersArray.every(ch => /^[A-Z]$/.test(ch))) {
            return res.status(400).json({
                success: false,
                message: 'letters must contain only single uppercase letters (A-Z)',
                data: { parsed: lettersArray }
            });
        }

        // 5) Generate combinations (format: `${series}${letter}`)
        const combinations = series.map(seriesNum => lettersArray.map(letter => `${seriesNum}${letter}`).join(','));

        const result = {
            same_number: sameNumberParsed,
            series_numbers: Array.isArray(series_numbers) ? series_numbers : String(series_numbers),
            letters: Array.isArray(letters) ? lettersArray : lettersArray.join(''),
            combinations,
            total_combinations: combinations.length * lettersArray.length
        };

        console.log('=== [SameMaster] generateCombinations result ===');
        console.log(JSON.stringify(result, null, 2));

        return res.status(200).json({ success: true, message: 'Combinations generated successfully', data: result });
    } catch (err) {
        console.error('=== [SameMaster] ERROR in generateCombinations ===');
        console.error(err.stack || err);
        return res.status(500).json({ success: false, message: 'Internal server error', data: { error: err.message } });
    }
};

// Test endpoint to verify combinationGenerator is working
exports.testCombinationGenerator = async (req, res) => {
	try {
		console.log('Testing combinationGenerator...');
		
		// Test the service directly
		const testResult = combinationGenerator.generateCombinations('3', '10,11,12', 'ABC');
		console.log('Test result:', testResult);
		
		return res.status(200).json({
			success: true,
			message: 'CombinationGenerator test successful',
			data: testResult
		});
	} catch (err) {
		console.error('Test failed:', err);
		return res.status(500).json({
			success: false,
			message: 'CombinationGenerator test failed',
			data: {
				error: err.message,
				stack: err.stack
			}
		});
	}
};

// Get audit logs for same master rules
exports.getAuditLogs = async (req, res) => {
	try {
		const { page = 1, limit = 10, same_master_id, executed_by } = req.query;
		const skip = (page - 1) * limit;
		
		// Build filter
		const filter = {};
		if (same_master_id) {
			filter.same_master_id = same_master_id;
		}
		if (executed_by) {
			filter.executed_by = executed_by;
		}
		
		const auditLogs = await SameMasterAudit.find(filter)
			.sort({ executed_at: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.populate('same_master_id', 'same_number page_logic priority')
			.populate('executed_by', 'fullName email')
			.select('-__v');
		
		const total = await SameMasterAudit.countDocuments(filter);
		
		return res.status(200).json({
			success: true,
			message: 'Audit logs retrieved successfully',
			data: {
				audit_logs: auditLogs,
				pagination: {
					current_page: parseInt(page),
					total_pages: Math.ceil(total / limit),
					total_records: total,
					limit: parseInt(limit)
				}
			}
		});
	} catch (err) {
		console.error('Error fetching audit logs:', err);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null
		});
	}
};
