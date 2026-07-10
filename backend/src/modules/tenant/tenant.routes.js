const express = require('express');

const tenantController = require('./tenant.controller');
const { authenticateUser } = require('../auth/auth.middleware');

const router = express.Router();

router.use(authenticateUser);
router.post('/', tenantController.createTenant);
router.get('/:id', tenantController.getTenant);
router.patch('/:id', tenantController.updateTenant);

module.exports = router;
