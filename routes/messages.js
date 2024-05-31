const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");

const { postMessage } = require("../controllers/messages");

router.post("/", postMessage);

module.exports = router;
