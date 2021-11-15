const mongoose = require('mongoose');

const channels_schema = new mongoose.Schema({
	id_user: {
		type: String,
		require: true
	}
}, { timestamps: true });
module.exports = mongoose.model('channels', channels_schema);