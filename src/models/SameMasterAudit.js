const mongoose = require('mongoose');

const sameMasterAuditSchema = new mongoose.Schema(
	{
		same_master_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SameMaster',
			required: true,
			index: true
		},
		executed_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SuperAdmin',
			required: true
		},
		executed_at: {
			type: Date,
			default: Date.now,
			index: true
		},
		matched_ticket_count: {
			type: Number,
			default: 0,
			required: true
		},
		matched_ticket_ids: {
			type: [mongoose.Schema.Types.ObjectId],
			default: []
		},
		payload: {
			type: mongoose.Schema.Types.Mixed, // JSONB equivalent
			default: {}
		},
		rule_details: {
			same_number: String,
			page_logic: String,
			priority: Number
		}
	},
	{ timestamps: true }
);

// Indexes for performance
sameMasterAuditSchema.index({ same_master_id: 1, executed_at: -1 });
sameMasterAuditSchema.index({ executed_by: 1, executed_at: -1 });
sameMasterAuditSchema.index({ executed_at: -1 });

// Static method to create audit entry
sameMasterAuditSchema.statics.createAuditEntry = async function(data) {
	const auditEntry = new this({
		same_master_id: data.same_master_id,
		executed_by: data.executed_by,
		matched_ticket_count: data.matched_ticket_count || 0,
		matched_ticket_ids: data.matched_ticket_ids || [],
		payload: data.payload || {},
		rule_details: data.rule_details || {}
	});
	
	return await auditEntry.save();
};

module.exports = mongoose.model('SameMasterAudit', sameMasterAuditSchema);
