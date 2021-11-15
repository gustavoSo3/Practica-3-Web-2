const mongoose = require('mongoose');

const sessions_schema = new mongoose.Schema({
	id_user: {
		type: String,
		require: true
	},
	token: {
		type: String,
		require: true
	}
}, { timestamps: true });
module.exports = mongoose.model('sessions', sessions_schema);