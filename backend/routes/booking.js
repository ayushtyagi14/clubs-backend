// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const { handleClubBooking } = require("../controllers/booking");

// POST route to create a new booking
router.post("/", handleClubBooking);

module.exports = router;
