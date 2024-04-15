// routes.js
const express = require("express");
const router = express.Router();
const { fetchUserDetails } = require("../controllers/accounts");

// Route to get a single document from a specified table
router.get("/details/:id", fetchUserDetails);

module.exports = router;
