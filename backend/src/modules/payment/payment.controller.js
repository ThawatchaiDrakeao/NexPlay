const paymentService = require('./payment.service');

const submitSlip = async (req, res, next) => {
  try {
    res.status(201).json({ slip: await paymentService.submitSlip(req.user.sub, req.body) });
  } catch (error) {
    next(error);
  }
};

const approvePayment = async (req, res, next) => {
  try {
    res.status(200).json({ payment: await paymentService.approvePayment(req.user.sub, req.params.id) });
  } catch (error) {
    next(error);
  }
};

const rejectPayment = async (req, res, next) => {
  try {
    res.status(200).json({ payment: await paymentService.rejectPayment(req.user.sub, req.params.id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitSlip,
  approvePayment,
  rejectPayment
};
