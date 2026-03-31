const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

// Temporary in-memory user store. Replace with DB persistence in production.
const users = new Map(); // key: email, value: { email, passwordHash, name }

const ensureJwtSecret = () => {
	if (!JWT_SECRET) {
		throw new Error('JWT_SECRET is not configured');
	}
};

const signup = async (req, res, next) => {
	try {
		ensureJwtSecret();
		const { email, password, name = '' } = req.body || {};

		if (!email || !password) {
			const err = new Error('Email and password are required');
			err.status = 400;
			throw err;
		}

		const normalizedEmail = String(email).toLowerCase().trim();

		if (users.has(normalizedEmail)) {
			const err = new Error('User already exists');
			err.status = 409;
			throw err;
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const userRecord = { email: normalizedEmail, passwordHash, name: name?.trim() || '' };
		users.set(normalizedEmail, userRecord);

		res.status(201).json({ message: 'User registered successfully' });
	} catch (err) {
		next(err);
	}
};

const login = async (req, res, next) => {
	try {
		ensureJwtSecret();
		const { email, password } = req.body || {};

		if (!email || !password) {
			const err = new Error('Email and password are required');
			err.status = 400;
			throw err;
		}

		const normalizedEmail = String(email).toLowerCase().trim();
		const user = users.get(normalizedEmail);

		if (!user) {
			const err = new Error('Invalid credentials');
			err.status = 401;
			throw err;
		}

		const passwordMatches = await bcrypt.compare(password, user.passwordHash);
		if (!passwordMatches) {
			const err = new Error('Invalid credentials');
			err.status = 401;
			throw err;
		}

		const token = jwt.sign({ sub: normalizedEmail }, JWT_SECRET, { expiresIn: '1h' });

		res.status(200).json({ token });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	signup,
	login,
};
