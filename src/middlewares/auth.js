const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const token = req.headers["x-access-token"];
	if (!token) {
		return res.status(403).send("token required as x-access-token");
	}
	try {
		const decoded = jwt.verify(token, process.env.TOKEN_KEY);
		req.user = decoded;
	} catch (err) {
		return res.status(401).send("Token not valid");
	}
	return next();
};