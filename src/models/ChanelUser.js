const mongoose = require('mongoose');

const channel_user_schema = new mongoose.Schema({
	id_chanel: {
		type: String,
		require: true
	},
	id_user: {
		type: String,
		require: true
	}
}, { timestamps: true });
module.exports = mongoose.model('channel_user', channel_user_schema);