const express = require("express");
const router = express.Router();
const {
  getUserTweets,
  getTweet,
  postTweet,
  like,
  answer,
  retweet,
  findTweet,
} = require("../controllers/tweets");

const { verifyUser } = require("../controllers/users");

//Post a new tweet
router.post("/", postTweet);

//get Tweets from a user
router.get("/user/:id", getUserTweets);

//get a Tweet by id
router.get("/:id", findTweet, getTweet);

//answer route

router.post("/:id/answer", verifyUser, findTweet, answer);

//retweet route

router.post("/:id/retweet", verifyUser, findTweet, retweet);

//comment route

//router.post("/:id/comment", comment);

//like route
router.post("/:id/like", verifyUser, findTweet, like);

module.exports = router;
