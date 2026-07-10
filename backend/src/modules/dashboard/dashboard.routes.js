const express = require('express');

const dashboardController = require('./dashboard.controller');
const { authenticateUser } = require('../auth/auth.middleware');

const router = express.Router();

router.use(authenticateUser);
router.get('/summary', dashboardController.getSummary);

module.exports = router;
