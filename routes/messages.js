const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");

const {
  getMessages,
  postMessage,
  getConversations,
  getConversationParticipants,
  postConversation,
} = require("../controllers/messages");

router.get("/conversations/:userID", getConversations);
router.get("/:conversationID/participants", getConversationParticipants);
router.get("/:conversationID", getMessages);
router.post("/:conversationID", postMessage);
router.post("/", postConversation);

module.exports = router;
