require('dotenv').config();

const express = require('express');
const cors = require('cors');

const whatsappRoutes = require('./routes/whatsapproutes');
const voiceRoutes = require('./routes/voiceroutes');
const ngoRoutes = require('./routes/ngoroutes');
const authRoutes = require('./routes/authroutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/auth', authRoutes);

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	const status = err.status || err.statusCode || 500;
	const message = err.message || 'Internal Server Error';
	res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
