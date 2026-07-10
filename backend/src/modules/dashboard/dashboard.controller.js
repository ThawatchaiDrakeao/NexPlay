const dashboardService = require('./dashboard.service');

const getSummary = async (req, res, next) => {
  try {
    const tenantId = req.query.tenantId || req.headers['x-tenant-id'];
    res.status(200).json({ summary: await dashboardService.getSummary(req.user.sub, tenantId) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary };
