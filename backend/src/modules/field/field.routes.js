const express = require('express');

const fieldController = require('./field.controller');
const { authenticateUser } = require('../auth/auth.middleware');

const router = express.Router();

router.use(authenticateUser);
router.post('/', fieldController.createField);
router.get('/', fieldController.listFields);
router.get('/:id', fieldController.getField);
router.patch('/:id', fieldController.updateField);

module.exports = router;
