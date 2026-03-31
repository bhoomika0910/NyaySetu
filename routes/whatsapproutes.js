const express = require('express');
const { handleIncomingMessage } = require('../controllers/whatsappcontrollers');

const router = express.Router();

router.post('/webhook', handleIncomingMessage);

module.exports = router;
