const express = require('express');

const healthRoutes = require('./healthRoutes');
const authRoutes = require('../modules/auth/auth.routes');
const tenantRoutes = require('../modules/tenant/tenant.routes');
const branchRoutes = require('../modules/branch/branch.routes');
const fieldRoutes = require('../modules/field/field.routes');
const scheduleRoutes = require('../modules/schedule/schedule.routes');
const bookingRoutes = require('../modules/booking/booking.routes');
const paymentRoutes = require('../modules/payment/payment.routes');
const lineRoutes = require('../modules/line/line.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/branches', branchRoutes);
router.use('/fields', fieldRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/line', lineRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
