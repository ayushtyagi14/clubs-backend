// routes.js
const express = require("express");
const router = express.Router();
const { fetchDocument } = require("../controllers/clubs");

// Route to get a single document from a specified table
router.get("/details/:table/:id", fetchDocument);

module.exports = router;
