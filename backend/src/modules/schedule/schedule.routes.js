const express = require('express');

const scheduleController = require('./schedule.controller');
const { authenticateUser } = require('../auth/auth.middleware');

const router = express.Router();

router.use(authenticateUser);
router.post('/opening-hours', scheduleController.upsertOpeningHours);
router.patch('/opening-hours', scheduleController.upsertOpeningHours);
router.post('/blocked-times', scheduleController.createBlockedTime);

module.exports = router;
