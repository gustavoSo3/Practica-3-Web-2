const mongoose = require('mongoose');

const messages_schema = new mongoose.Schema({
	id_chanel: {
		type: String,
		require: true
	},
	id_user: {
		type: String,
		require: true
	},
	message: {
		type: String,
		require: true
	}
}, { timestamps: true });
module.exports = mongoose.model('messages', messages_schema);