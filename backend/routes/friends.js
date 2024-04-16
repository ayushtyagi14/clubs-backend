// routes.js
const express = require("express");
const router = express.Router();
const { sendFriendRequest, acceptFriendRequest, declineFriendRequest } = require("../controllers/friends");

// Route to get a single document from a specified table
router.post("/send-request", sendFriendRequest);
router.post("/accept-request", acceptFriendRequest);
router.post("/decline-request", declineFriendRequest);

module.exports = router;
