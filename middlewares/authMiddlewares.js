const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const authMiddleware = (req, res, next) => {
	try {
		if (!JWT_SECRET) {
			const err = new Error('JWT_SECRET is not configured');
			err.status = 500;
			throw err;
		}

		const authHeader = req.headers.authorization || '';
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

		if (!token) {
			const err = new Error('Unauthorized');
			err.status = 401;
			throw err;
		}

		const payload = jwt.verify(token, JWT_SECRET);
		req.user = payload;
		next();
	} catch (err) {
		if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
			err.status = 401;
			err.message = 'Unauthorized';
		}
		next(err);
	}
};

module.exports = authMiddleware;
