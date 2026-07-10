const branchService = require('./branch.service');

const createBranch = async (req, res, next) => {
  try {
    res.status(201).json({ branch: await branchService.createBranch(req.user.sub, req.body) });
  } catch (error) {
    next(error);
  }
};

const listBranches = async (req, res, next) => {
  try {
    res.status(200).json({ branches: await branchService.listBranches(req.user.sub, req.query.tenantId || req.headers['x-tenant-id']) });
  } catch (error) {
    next(error);
  }
};

const getBranch = async (req, res, next) => {
  try {
    res.status(200).json({ branch: await branchService.getBranch(req.user.sub, req.query.tenantId || req.headers['x-tenant-id'], req.params.id) });
  } catch (error) {
    next(error);
  }
};

const updateBranch = async (req, res, next) => {
  try {
    res.status(200).json({ branch: await branchService.updateBranch(req.user.sub, req.body.tenantId || req.headers['x-tenant-id'], req.params.id, req.body) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBranch,
  listBranches,
  getBranch,
  updateBranch
};
