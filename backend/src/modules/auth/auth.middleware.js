const { HttpError } = require('../../utils/httpError');
const { verifyJwt } = require('./auth.service');

const authenticateUser = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'Authentication required');
    }

    req.user = verifyJwt(token);
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  const memberships = req.user?.memberships || [];
  const hasRole = memberships.some((membership) => allowedRoles.includes(membership.role));

  if (!hasRole) {
    next(new HttpError(403, 'Insufficient role'));
    return;
  }

  next();
};

const requireTenantAccess = (req, res, next) => {
  const tenantId = req.params.tenantId || req.headers['x-tenant-id'];
  const memberships = req.user?.memberships || [];

  if (!tenantId) {
    next(new HttpError(400, 'Tenant id is required'));
    return;
  }

  const hasTenantAccess = memberships.some((membership) => membership.tenantId === tenantId);

  if (!hasTenantAccess) {
    next(new HttpError(403, 'Tenant access denied'));
    return;
  }

  req.tenantId = tenantId;
  next();
};

module.exports = {
  authenticateUser,
  requireRole,
  requireTenantAccess
};
