const bookingService = require('./booking.service');

const createBooking = async (req, res, next) => {
  try {
    res.status(201).json(await bookingService.createBooking(req.user.sub, req.body));
  } catch (error) {
    next(error);
  }
};

const listBookings = async (req, res, next) => {
  try {
    res.status(200).json({ bookings: await bookingService.listBookings(req.user.sub, req.query.tenantId || req.headers['x-tenant-id']) });
  } catch (error) {
    next(error);
  }
};

const getBooking = async (req, res, next) => {
  try {
    res.status(200).json({ booking: await bookingService.getBooking(req.user.sub, req.params.id) });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    res.status(200).json({ booking: await bookingService.cancelBooking(req.user.sub, req.params.id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking
};
