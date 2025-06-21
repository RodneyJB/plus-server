const express = require('express');
const router = express.Router();
const { handleReplaceParticipant } = require('../controllers/replaceParticipant');

router.post('/subscribe', handleReplaceParticipant);

module.exports = router;
