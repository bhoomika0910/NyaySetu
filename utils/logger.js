const logInfo = (message, meta = {}) => {
	const payload = { level: 'info', message, ...meta };
	console.log(JSON.stringify(payload));
};

const logError = (message, meta = {}) => {
	const payload = { level: 'error', message, ...meta };
	console.error(JSON.stringify(payload));
};

module.exports = {
	logInfo,
	logError,
};
