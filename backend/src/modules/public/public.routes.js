const express = require("express");

const publicController = require("./public.controller");
const availabilityController = require("./public.availability.controller");

const router = express.Router();

router.get("/fields", publicController.listFields);

router.get("/availability", availabilityController.getAvailability);

router.post("/bookings", publicController.createPublicBooking);
router.post("/payments/confirm", publicController.confirmPublicPayment);

module.exports = router;
