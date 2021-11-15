const mongoose = require('mongoose');

const users_schema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	email: {
		type: String,
		require: true
	},
	password: {
		type: String,
		require: true
	},
	token: {
		type: String
	}
}, { timestamps: true });
module.exports = mongoose.model('users', users_schema);