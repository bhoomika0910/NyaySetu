require('dotenv').config();

const PORT = process.env.PORT || 5000;
const API_BASE_URL = process.env.API_BASE_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || '';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';

module.exports = {
	PORT,
	API_BASE_URL,
	JWT_SECRET,
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
};
