const tenantService = require('./tenant.service');

const createTenant = async (req, res, next) => {
  try {
    const tenant = await tenantService.createTenant(req.user.sub, req.body);
    res.status(201).json({ tenant });
  } catch (error) {
    next(error);
  }
};

const getTenant = async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.user.sub, req.params.id);
    res.status(200).json({ tenant });
  } catch (error) {
    next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const tenant = await tenantService.updateTenant(req.user.sub, req.params.id, req.body);
    res.status(200).json({ tenant });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTenant,
  getTenant,
  updateTenant
};
