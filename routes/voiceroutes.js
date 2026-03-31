const express = require('express');
const { voiceToText, textToVoice } = require('../controllers/voicecontrollers');

const router = express.Router();

router.post('/voice-to-text', voiceToText);
router.post('/text-to-voice', textToVoice);

module.exports = router;
