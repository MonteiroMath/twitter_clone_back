const express = require("express");
const router = express.Router();
const {
  getUserTweets,
  getTweet,
  postTweet,
  handleLike,
  retweet,
  comment,
  undoRetweet,
  findTweet,
} = require("../controllers/tweets");

const { verifyUser } = require("../controllers/users");

//get a Tweet by id
router.get("/:id", findTweet, getTweet);

//get Tweets from a user
router.get("/user/:id", getUserTweets);

//Post a new tweet
router.post("/", postTweet);

//like route
router.put("/:id/likes", verifyUser, findTweet, handleLike);

//retweet route

router.post("/:id/retweet", verifyUser, findTweet, retweet);

//undo retweet route

router.delete("/:id/retweet", verifyUser, findTweet, undoRetweet);

//comment/answer route

router.post("/:id/comment", verifyUser, findTweet, comment);

module.exports = router;
