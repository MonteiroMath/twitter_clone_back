const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");

const {
  getMessages,
  postMessage,
  getConversations,
  getSummary,
  postConversation,
} = require("../controllers/messages");

router.get("/conversations/:userID", getConversations);
router.get("/:conversationID/summary", getSummary);
router.get("/:conversationID", getMessages);
router.post("/:conversationID", postMessage);
router.post("/", postConversation);

module.exports = router;
