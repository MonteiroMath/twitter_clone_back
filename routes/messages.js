const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");

const {
  getMessages,
  postMessage,
  getConversations,
} = require("../controllers/messages");

router.get("/conversations/:userID", getConversations);
router.get("/:authorID/:recipientID", getMessages);
router.post("/", postMessage);

module.exports = router;
