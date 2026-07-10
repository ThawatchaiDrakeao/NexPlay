const express = require('express');

const healthRoutes = require('./healthRoutes');
const authRoutes = require('../modules/auth/auth.routes');
const tenantRoutes = require('../modules/tenant/tenant.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);

module.exports = router;
