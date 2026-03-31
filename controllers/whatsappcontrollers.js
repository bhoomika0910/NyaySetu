const { analyzeCase, generateFIR } = require('../services/aiservices');

const escapeXml = (unsafe = '') =>
	unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

const formatFirDraft = ({ firDraft = {}, nextSteps = [] }) => {
	const {
		complainant = 'Complainant: [add details]',
		accused = 'Accused: [add details]',
		incidentDetails = 'Incident details missing',
		sectionsSuggested = [],
		prayer = 'Prayer not specified',
	} = firDraft;

	const lines = [
		'Draft FIR:',
		complainant,
		accused,
		`Incident: ${incidentDetails}`,
		`Sections: ${sectionsSuggested.join(', ') || 'To be determined'}`,
		`Prayer: ${prayer}`,
	];

	if (nextSteps.length) {
		lines.push('', 'Next steps:');
		nextSteps.forEach((step, idx) => lines.push(`${idx + 1}. ${step}`));
	}

	return lines.join('\n');
};

const formatCaseAnalysis = ({ summary = 'No summary available', nextSteps = [] }) => {
	const lines = [`Summary: ${summary}`];

	if (nextSteps.length) {
		lines.push('', 'Next steps:');
		nextSteps.forEach((step, idx) => lines.push(`${idx + 1}. ${step}`));
	}

	return lines.join('\n');
};

const buildTwiml = (message) => `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;

const handleIncomingMessage = async (req, res, next) => {
	try {
		const incomingMessage = req.body?.Body || '';
		const text = incomingMessage.trim();
		const intent = text.toLowerCase();
		const wantsFir = intent.includes('fir') || intent.includes('complaint');

		let responsePayload;
		let formatted;

		if (wantsFir) {
			responsePayload = await generateFIR(text);
			formatted = formatFirDraft(responsePayload);
		} else {
			responsePayload = await analyzeCase(text);
			formatted = formatCaseAnalysis(responsePayload);
		}

		const twiml = buildTwiml(formatted);
		res.type('text/xml').status(200).send(twiml);
	} catch (err) {
		next(err);
	}
};

module.exports = {
	handleIncomingMessage,
};
