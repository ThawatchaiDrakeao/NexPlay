const express = require('express');

const bookingController = require('./booking.controller');
const { authenticateUser } = require('../auth/auth.middleware');

const router = express.Router();

router.use(authenticateUser);
router.post('/', bookingController.createBooking);
router.get('/', bookingController.listBookings);
router.get('/:id', bookingController.getBooking);
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
