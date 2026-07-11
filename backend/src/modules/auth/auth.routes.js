const express = require("express");

const authController = require("./auth.controller");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/line", authController.lineLogin);

module.exports = router;
