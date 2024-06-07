const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");

const { getMessages, postMessage } = require("../controllers/messages");

router.get("/:authorID/:recipientID", getMessages);
router.post("/", postMessage);

module.exports = router;
