const { calculateAvailableSlots } = require("../availability/availability.service");

const getAvailability = async (req, res, next) => {
  try {
    const { fieldId, date } = req.query;

    const slots = await calculateAvailableSlots(
      fieldId,
      date
    );

    res.status(200).json({
      slots,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
};
