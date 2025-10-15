const mongoose = require('mongoose');

const drawMasterSchema = new mongoose.Schema({
	drawTime: {
		date: { type: String, required: true },
		time: { type: String, required: true }
	},
	lastUnsoldTime: {
		date: { type: String, required: true },
		time: { type: String, required: true }
	},
	sellingRate: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('DrawMaster', drawMasterSchema);
