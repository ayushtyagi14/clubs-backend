// routes.js
const express = require("express");
const router = express.Router();
const { fetchDetails, fetchClubs, fetchClubType } = require("../controllers/clubs");

// Route to get a single document from a specified table
router.get("/details/:type/:id", fetchDetails);
router.get("/details/:type", fetchClubType);
router.get("/getAllClubs", fetchClubs)

module.exports = router;
