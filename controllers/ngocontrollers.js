const sampleNgos = [
	{
		name: 'Legal Aid Foundation',
		distanceKm: 2.1,
		contact: '+91-9876543210',
	},
	{
		name: 'Justice For All Trust',
		distanceKm: 5.4,
		contact: '+91-9123456780',
	},
	{
		name: 'Community Rights Centre',
		distanceKm: 1.7,
		contact: '+91-9988776655',
	},
];

const getNearbyHelp = async (req, res, next) => {
	try {
		const { lat, lng } = req.query;

		if (!lat || !lng) {
			const err = new Error('lat and lng are required');
			err.status = 400;
			throw err;
		}

		// For now, return mock data sorted by distance
		const results = [...sampleNgos].sort((a, b) => a.distanceKm - b.distanceKm);

		res.status(200).json({
			query: { lat, lng },
			nearby: results,
		});
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getNearbyHelp,
};
