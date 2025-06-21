const express = require('express');
const router = express.Router();
const { handleSetDateToday } = require('../controllers/setDateToday');

router.post('/subscribe', handleSetDateToday);

module.exports = router;
