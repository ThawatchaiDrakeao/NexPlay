const express = require('express');

const paymentController = require('./payment.controller');
const { authenticateUser } = require('../auth/auth.middleware');

const router = express.Router();

router.use(authenticateUser);
router.post('/slip', paymentController.submitSlip);
router.patch('/:id/approve', paymentController.approvePayment);
router.patch('/:id/reject', paymentController.rejectPayment);

module.exports = router;
