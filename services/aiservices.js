async function analyzeCase(text) {
	const trimmed = text?.trim() || '';

	return {
		summary: trimmed
			? `Preliminary assessment: the matter involves ${trimmed.slice(0, 120)}...`
			: 'No case details provided. Please share facts, dates, and parties involved.',
		nextSteps: [
			'List key facts chronologically with dates and involved parties.',
			'Collect supporting documents (agreements, notices, receipts, messages).',
			'Identify jurisdiction and any limitation periods approaching.',
			'Draft a brief statement of issues and desired remedy.',
		],
	};
}

async function generateFIR(text) {
	const facts = text?.trim() || 'No incident details provided';

	return {
		firDraft: {
			complainant: 'Name: [Your Name], Contact: [Phone/Email]',
			accused: 'Name/Description: [If known]',
			incidentDetails: facts,
			sectionsSuggested: ['IPC 420 (Cheating) — placeholder; adjust based on facts'],
			prayer: 'Request to register FIR, investigate promptly, and provide updates.',
		},
		nextSteps: [
			'Verify incident date/time/location are clearly stated.',
			'Attach any evidence: documents, screenshots, audio/video, witness details.',
			'Visit the police station with ID proof; request a stamped acknowledgment.',
			'If refused, consider submitting a written complaint to the SP under CrPC 154(3).',
		],
	};
}

async function scanContract(text) {
	const excerpt = (text || '').trim().slice(0, 160);

	return {
		summary:
			excerpt && excerpt.length > 0
				? `Detected clauses referencing: ${excerpt}...`
				: 'No contract text provided. Add the relevant clauses for review.',
		risks: [
			'Check termination clause for notice period and unilateral rights.',
			'Review liability caps, exclusions, and indemnity scope.',
			'Confirm governing law, jurisdiction, and dispute resolution method.',
			'Ensure payment terms and milestones are clearly defined.',
		],
		recommendations: [
			'Add cure periods before termination where possible.',
			'Limit indemnity to third-party claims caused by breach or misconduct.',
			'Seek mutual limitation of liability excluding willful misconduct or fraud.',
			'Clarify IP ownership and license scope for deliverables.',
		],
	};
}

module.exports = {
	analyzeCase,
	generateFIR,
	scanContract,
};
