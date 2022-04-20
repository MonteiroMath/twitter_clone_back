const express = require("express");
const router = express.Router();
const {
  getUserTweets,
  getTweet,
  postTweet,
  handleLike,
  answer,
  retweet,
  undoRetweet,
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

//undo retweet route

router.delete("/:id/retweet", verifyUser, findTweet, undoRetweet);

//comment route

//router.post("/:id/comment", comment);

//like route
router.put("/:id/likes", verifyUser, findTweet, handleLike);

module.exports = router;
