const express = require('express');
const router = express.Router();
const { handleReplaceParticipant } = require('../controllers/replaceParticipant');

// Log raw body for debugging
router.post('/subscribe', (req, res, next) => {
  console.log('📦 Raw Request Body:', JSON.stringify(req.body, null, 2));
  next(); // pass to the controller
}, handleReplaceParticipant);

module.exports = router;
