const mongoose = require('mongoose');

const channels_schema = new mongoose.Schema({
	id_user: {
		type: String,
		require: true
	},
	name: {
		type: String,
		require: true
	},
	invite_link: {
		type: String
	}
}, { timestamps: true });
module.exports = mongoose.model('channels', channels_schema);