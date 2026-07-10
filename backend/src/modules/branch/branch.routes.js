const express = require('express');

const branchController = require('./branch.controller');
const { authenticateUser } = require('../auth/auth.middleware');

const router = express.Router();

router.use(authenticateUser);
router.post('/', branchController.createBranch);
router.get('/', branchController.listBranches);
router.get('/:id', branchController.getBranch);
router.patch('/:id', branchController.updateBranch);

module.exports = router;
