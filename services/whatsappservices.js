const twilio = require('twilio');
const {
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
} = require('../config/config');

const client = (() => {
	if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
		console.warn('Twilio credentials are not configured. WhatsApp sending will fail until set.');
		return null;
	}
	return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
})();

async function sendWhatsAppMessage(to, message) {
	if (!client) {
		throw new Error('Twilio client is not initialized. Check environment variables.');
	}
	if (!to) {
		throw new Error('Recipient number is required');
	}
	if (!message) {
		throw new Error('Message content is required');
	}

	const from = process.env.TWILIO_WHATSAPP_FROM;
	if (!from) {
		throw new Error('TWILIO_WHATSAPP_FROM is not configured');
	}

	try {
		const normalizedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
		const response = await client.messages.create({
			body: message,
			from,
			to: normalizedTo,
		});
		return response;
	} catch (err) {
		console.error('Error sending WhatsApp message:', err.message);
		throw err;
	}
}

module.exports = {
	sendWhatsAppMessage,
};
