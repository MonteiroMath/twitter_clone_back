const express = require("express");
const router = express.Router();
const {
  getUserTweets,
  getTweet,
  postTweet,
  handleLike,
  retweet,
  undoRetweet,
  findTweet,
  getAnswers,
  postAnswer,
} = require("../controllers/tweets");

const { verifyUser } = require("../controllers/users");

//get a Tweet by id
router.get("/:id", findTweet, getTweet);

//get Tweets from a user
router.get("/user/:id", getUserTweets);

//get Answers for a tweet
router.get("/answers/:parentId", getAnswers);

//Post a new tweet
router.post("/", postTweet);

//Post a new answer
router.post("/answers/:parentId", postAnswer);

//like route
router.put("/:id/likes", verifyUser, findTweet, handleLike);

//retweet route

router.post("/:id/retweet", verifyUser, findTweet, retweet);

//undo retweet route

router.delete("/:id/retweet", verifyUser, findTweet, undoRetweet);

module.exports = router;
