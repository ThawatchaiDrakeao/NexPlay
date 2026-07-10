const scheduleService = require('./schedule.service');

const upsertOpeningHours = async (req, res, next) => {
  try {
    res.status(200).json({ openingHours: await scheduleService.upsertOpeningHours(req.user.sub, req.body) });
  } catch (error) {
    next(error);
  }
};

const createBlockedTime = async (req, res, next) => {
  try {
    res.status(201).json({ blockedTime: await scheduleService.createBlockedTime(req.user.sub, req.body) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upsertOpeningHours,
  createBlockedTime
};
