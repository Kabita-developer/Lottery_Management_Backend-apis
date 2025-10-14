class CombinationGenerator {
	/**
	 * Generate all possible ticket combinations
	 * @param {string} sameNumber - The same number (e.g., "5")
	 * @param {string} seriesNumbers - Comma-separated series numbers (e.g., "20,21,22,23,24,25")
	 * @param {string} letters - Letters to combine (e.g., "ABCDE")
	 * @returns {Object} - Object with combinations array
	 */
	generateCombinations(sameNumber, seriesNumbers, letters) {
		try {
			console.log('generateCombinations called with:', { sameNumber, seriesNumbers, letters });
			
			// Parse series numbers
			console.log('Parsing series numbers...');
			const series = this.parseSeriesNumbers(seriesNumbers);
			console.log('Parsed series:', series);
			
			// Parse letters
			console.log('Parsing letters...');
			const letterArray = letters.split('');
			console.log('Parsed letters:', letterArray);
			
			// Generate combinations
			console.log('Generating combinations...');
			const combinations = [];
			
			series.forEach((seriesNum, index) => {
				console.log(`Processing series ${index + 1}/${series.length}: ${seriesNum}`);
				const seriesCombinations = [];
				letterArray.forEach((letter, letterIndex) => {
					console.log(`  Processing letter ${letterIndex + 1}/${letterArray.length}: ${letter}`);
					const combination = `${seriesNum}${letter}`;
					console.log(`  Generated combination: ${combination}`);
					seriesCombinations.push(combination);
				});
				combinations.push(seriesCombinations.join(','));
				console.log(`  Series combinations: ${seriesCombinations.join(',')}`);
			});

			const result = {
				same_number: sameNumber,
				series_numbers: seriesNumbers,
				letters: letters,
				combinations: combinations,
				total_combinations: combinations.length * letterArray.length
			};
			
			console.log('Final result:', result);
			return result;
		} catch (error) {
			console.error('Error in generateCombinations:', error);
			throw new Error(`Failed to generate combinations: ${error.message}`);
		}
	}

	/**
	 * Parse series numbers from string
	 * @param {string} seriesNumbers - Comma-separated or JSON array string
	 * @returns {Array} - Array of series numbers
	 */
	parseSeriesNumbers(seriesNumbers) {
		console.log('parseSeriesNumbers called with:', seriesNumbers);
		
		if (!seriesNumbers) {
			console.log('No series numbers provided, returning empty array');
			return [];
		}
		
		try {
			// Try JSON array first
			if (seriesNumbers.startsWith('[') && seriesNumbers.endsWith(']')) {
				console.log('Parsing as JSON array');
				const parsed = JSON.parse(seriesNumbers);
				console.log('JSON parsed result:', parsed);
				return parsed;
			}
			
			// Parse comma-separated values
			console.log('Parsing as comma-separated values');
			const split = seriesNumbers.split(',');
			console.log('Split result:', split);
			const trimmed = split.map(n => n.trim());
			console.log('Trimmed result:', trimmed);
			const filtered = trimmed.filter(n => n);
			console.log('Filtered result:', filtered);
			return filtered;
		} catch (e) {
			console.error('Error parsing series numbers:', e);
			// Fallback to comma-separated
			console.log('Using fallback parsing');
			const fallback = seriesNumbers.split(',').map(n => n.trim()).filter(n => n);
			console.log('Fallback result:', fallback);
			return fallback;
		}
	}

	/**
	 * Generate combinations with custom format
	 * @param {string} sameNumber - The same number
	 * @param {string} seriesNumbers - Series numbers
	 * @param {string} letters - Letters
	 * @param {string} format - Format pattern (e.g., "{SERIES}{LETTER}", "{LETTER}{SERIES}")
	 * @returns {Object} - Object with combinations
	 */
	generateCombinationsWithFormat(sameNumber, seriesNumbers, letters, format = '{SERIES}{LETTER}') {
		const series = this.parseSeriesNumbers(seriesNumbers);
		const letterArray = letters.split('');
		
		const combinations = [];
		
		series.forEach(seriesNum => {
			const seriesCombinations = [];
			letterArray.forEach(letter => {
				const combination = format
					.replace('{SERIES}', seriesNum)
					.replace('{LETTER}', letter)
					.replace('{NUMBER}', sameNumber);
				seriesCombinations.push(combination);
			});
			combinations.push(seriesCombinations.join(','));
		});

		return {
			same_number: sameNumber,
			series_numbers: seriesNumbers,
			letters: letters,
			format: format,
			combinations: combinations,
			total_combinations: combinations.length * letterArray.length
		};
	}

	/**
	 * Generate all possible ticket numbers for a given rule
	 * @param {Object} rule - SameMaster rule object
	 * @returns {Object} - Generated combinations
	 */
	generateFromRule(rule) {
		if (!rule.series_numbers || !rule.same_number) {
			throw new Error('Rule must have series_numbers and same_number');
		}

		// Default letters if not specified in page_logic_details
		let letters = 'ABCDE';
		
		if (rule.page_logic === 'WITH_PAGE_LOGIC' && 
			rule.page_logic_details && 
			rule.page_logic_details.type === 'letter_set') {
			letters = rule.page_logic_details.letters.join('');
		}

		return this.generateCombinations(rule.same_number, rule.series_numbers, letters);
	}

	/**
	 * Validate input parameters
	 * @param {string} sameNumber - Same number
	 * @param {string} seriesNumbers - Series numbers
	 * @param {string} letters - Letters
	 * @returns {Object} - Validation result
	 */
	validateInputs(sameNumber, seriesNumbers, letters) {
		console.log('validateInputs called with:', { sameNumber, seriesNumbers, letters });
		const errors = [];

		// Check if inputs exist and are strings
		if (!sameNumber || typeof sameNumber !== 'string' || sameNumber.trim() === '') {
			errors.push('same_number is required and must be a non-empty string');
		}

		if (!seriesNumbers || typeof seriesNumbers !== 'string' || seriesNumbers.trim() === '') {
			errors.push('series_numbers is required and must be a non-empty string');
		}

		if (!letters || typeof letters !== 'string' || letters.trim() === '') {
			errors.push('letters is required and must be a non-empty string');
		}

		// Validate letters format
		if (letters && typeof letters === 'string') {
			console.log('Validating letters format:', letters);
			if (!/^[A-Z]+$/.test(letters)) {
				errors.push(`letters must contain only uppercase letters. Received: "${letters}"`);
			}
		}

		// Validate series numbers
		if (seriesNumbers && typeof seriesNumbers === 'string') {
			console.log('Validating series numbers:', seriesNumbers);
			try {
				const series = this.parseSeriesNumbers(seriesNumbers);
				console.log('Parsed series for validation:', series);
				if (series.length === 0) {
					errors.push(`series_numbers must contain valid numbers. Received: "${seriesNumbers}"`);
				}
			} catch (error) {
				errors.push(`Invalid series_numbers format: ${error.message}`);
			}
		}

		const result = {
			isValid: errors.length === 0,
			errors: errors
		};
		
		console.log('Validation result:', result);
		return result;
	}
}

module.exports = new CombinationGenerator();
