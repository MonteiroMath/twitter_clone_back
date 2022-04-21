const express = require("express");
const router = express.Router();
const {
  getUserTweets,
  getTweet,
  postTweet,
  handleLike,
  answer,
  retweet,
  comment,
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

//retweet route

router.post("/:id/retweet", verifyUser, findTweet, retweet);

//undo retweet route

router.delete("/:id/retweet", verifyUser, findTweet, undoRetweet);

//comment/answer route

router.post("/:id/comment", findTweet, comment);

//like route
router.put("/:id/likes", verifyUser, findTweet, handleLike);

module.exports = router;
