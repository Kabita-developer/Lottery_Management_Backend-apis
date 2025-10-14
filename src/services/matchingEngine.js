const SameMaster = require('../models/SameMaster');
const SameMasterAudit = require('../models/SameMasterAudit');

class MatchingEngine {
	constructor() {
		this.rules = [];
		this.seriesMap = new Map();
	}

	/**
	 * Load all active rules sorted by priority
	 */
	async loadRules() {
		this.rules = await SameMaster.find({ is_active: true })
			.sort({ priority: -1, created_at: -1 })
			.lean();
		
		// Build series map for quick lookup
		this.seriesMap.clear();
		this.rules.forEach(rule => {
			if (rule.series_numbers) {
				const series = this.parseSeriesNumbers(rule.series_numbers);
				series.forEach(seriesNum => {
					if (!this.seriesMap.has(seriesNum)) {
						this.seriesMap.set(seriesNum, []);
					}
					this.seriesMap.get(seriesNum).push(rule);
				});
			}
		});
	}

	/**
	 * Parse series numbers from string or JSON
	 */
	parseSeriesNumbers(seriesNumbers) {
		if (!seriesNumbers) return [];
		try {
			if (seriesNumbers.startsWith('[') && seriesNumbers.endsWith(']')) {
				return JSON.parse(seriesNumbers);
			}
			return seriesNumbers.split(',').map(n => n.trim());
		} catch (e) {
			return [];
		}
	}

	/**
	 * Match tickets against rules
	 */
	async matchTickets(tickets, executedBy) {
		await this.loadRules();
		
		const matches = [];
		const unmatched = [];
		const auditEntries = [];

		// Process each ticket
		for (const ticket of tickets) {
			const ticketMatches = [];
			
			// Check against each rule (sorted by priority)
			for (const rule of this.rules) {
				if (this.matchesRule(ticket, rule)) {
					ticketMatches.push({
						rule_id: rule._id,
						priority: rule.priority,
						matched_by: rule.same_number
					});
				}
			}

			if (ticketMatches.length > 0) {
				// Sort by priority (highest first)
				ticketMatches.sort((a, b) => b.priority - a.priority);
				
				matches.push({
					ticket_id: ticket.ticket_id,
					ticket_no: ticket.ticket_no,
					rule_id: ticketMatches[0].rule_id,
					matched_by: ticketMatches[0].matched_by,
					priority: ticketMatches[0].priority,
					all_matches: ticketMatches
				});

				// Track for audit
				ticketMatches.forEach(match => {
					const rule = this.rules.find(r => r._id.toString() === match.rule_id.toString());
					if (rule) {
						const auditKey = rule._id.toString();
						if (!auditEntries.find(entry => entry.rule_id === auditKey)) {
							auditEntries.push({
								rule_id: auditKey,
								rule: rule,
								matched_tickets: []
							});
						}
						const auditEntry = auditEntries.find(entry => entry.rule_id === auditKey);
						auditEntry.matched_tickets.push(ticket.ticket_id);
					}
				});
			} else {
				unmatched.push({
					ticket_id: ticket.ticket_id,
					ticket_no: ticket.ticket_no
				});
			}
		}

		// Create audit entries
		for (const auditEntry of auditEntries) {
			await SameMasterAudit.createAuditEntry({
				same_master_id: auditEntry.rule_id,
				executed_by: executedBy,
				matched_ticket_count: auditEntry.matched_tickets.length,
				matched_ticket_ids: auditEntry.matched_tickets,
				payload: {
					input_summary: {
						total_tickets: tickets.length,
						matched_tickets: auditEntry.matched_tickets.length
					}
				},
				rule_details: {
					same_number: auditEntry.rule.same_number,
					page_logic: auditEntry.rule.page_logic,
					priority: auditEntry.rule.priority
				}
			});
		}

		return {
			matched: matches,
			unmatched: unmatched,
			total_processed: tickets.length,
			total_matched: matches.length,
			total_unmatched: unmatched.length
		};
	}

	/**
	 * Check if a ticket matches a specific rule
	 */
	matchesRule(ticket, rule) {
		if (rule.page_logic === 'WITHOUT_PAGE_LOGIC') {
			return this.matchWithoutPageLogic(ticket, rule);
		} else {
			return this.matchWithPageLogic(ticket, rule);
		}
	}

	/**
	 * Match without page logic
	 */
	matchWithoutPageLogic(ticket, rule) {
		// Check series numbers if present
		if (rule.series_numbers) {
			const series = this.parseSeriesNumbers(rule.series_numbers);
			if (ticket.series && !series.includes(ticket.series)) {
				return false;
			}
		}

		// Check same_number matching
		if (this.isNumeric(rule.same_number)) {
			// Numeric matching - compare last N digits
			const sameNumberLength = rule.same_number.length;
			const ticketSuffix = ticket.ticket_no.slice(-sameNumberLength);
			return ticketSuffix === rule.same_number;
		} else {
			// Non-numeric matching - check prefix
			return ticket.ticket_no.startsWith(rule.same_number);
		}
	}

	/**
	 * Match with page logic
	 */
	matchWithPageLogic(ticket, rule) {
		if (!rule.page_logic_details) return false;

		const details = rule.page_logic_details;

		switch (details.type) {
			case 'suffix':
				return this.matchSuffix(ticket, rule, details);
			case 'page_range':
				return this.matchPageRange(ticket, rule, details);
			case 'letter_set':
				return this.matchLetterSet(ticket, rule, details);
			default:
				return false;
		}
	}

	/**
	 * Match suffix pattern
	 */
	matchSuffix(ticket, rule, details) {
		const matchLength = details.match_length;
		const pattern = details.pattern === 'same_number' ? rule.same_number : details.pattern;
		const ticketSuffix = ticket.ticket_no.slice(-matchLength);
		return ticketSuffix === pattern;
	}

	/**
	 * Match page range
	 */
	matchPageRange(ticket, rule, details) {
		if (!ticket.page_number) return false;

		const pages = details.pages;
		if (Array.isArray(pages)) {
			return pages.includes(ticket.page_number);
		} else if (pages.from && pages.to) {
			return ticket.page_number >= pages.from && ticket.page_number <= pages.to;
		}
		return false;
	}

	/**
	 * Match letter set
	 */
	matchLetterSet(ticket, rule, details) {
		const letters = details.letters;
		const applyOn = details.apply_on;
		const format = details.format;

		// Generate expected patterns
		const expectedPatterns = this.generateLetterSetPatterns(rule.same_number, letters, format, applyOn);
		
		return expectedPatterns.some(pattern => {
			if (applyOn === 'prefix') {
				return ticket.ticket_no.startsWith(pattern);
			} else {
				return ticket.ticket_no.endsWith(pattern);
			}
		});
	}

	/**
	 * Generate letter set patterns
	 */
	generateLetterSetPatterns(sameNumber, letters, format, applyOn) {
		const patterns = [];
		
		letters.forEach(letter => {
			const pattern = format.replace('{L}', letter).replace('{NUMBER}', sameNumber);
			patterns.push(pattern);
		});

		return patterns;
	}

	/**
	 * Check if string is numeric
	 */
	isNumeric(str) {
		return /^\d+$/.test(str);
	}
}

module.exports = new MatchingEngine();
