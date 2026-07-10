const fieldService = require('./field.service');

const createField = async (req, res, next) => {
  try {
    res.status(201).json({ field: await fieldService.createField(req.user.sub, req.body) });
  } catch (error) {
    next(error);
  }
};

const listFields = async (req, res, next) => {
  try {
    res.status(200).json({ fields: await fieldService.listFields(req.user.sub, req.query.tenantId || req.headers['x-tenant-id'], req.query.branchId) });
  } catch (error) {
    next(error);
  }
};

const getField = async (req, res, next) => {
  try {
    res.status(200).json({ field: await fieldService.getField(req.user.sub, req.query.tenantId || req.headers['x-tenant-id'], req.params.id) });
  } catch (error) {
    next(error);
  }
};

const updateField = async (req, res, next) => {
  try {
    res.status(200).json({ field: await fieldService.updateField(req.user.sub, req.body.tenantId || req.headers['x-tenant-id'], req.params.id, req.body) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createField,
  listFields,
  getField,
  updateField
};
