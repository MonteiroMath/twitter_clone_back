const express = require("express");
const router = express.Router();
const { getUserTweets, getTweet } = require("../controllers/tweets");

//get Tweets from a user
router.get("/user/:id", getUserTweets);

//get a Tweet by id
router.get("/:id", getTweet);

module.exports = router;
