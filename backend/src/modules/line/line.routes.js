const express = require('express');

const lineController = require('./line.controller');

const router = express.Router();

router.post('/webhook', lineController.webhook);

module.exports = router;
