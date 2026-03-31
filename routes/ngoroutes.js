const express = require('express');
const { getNearbyHelp } = require('../controllers/ngocontrollers');

const router = express.Router();

router.get('/nearby-help', getNearbyHelp);

module.exports = router;
