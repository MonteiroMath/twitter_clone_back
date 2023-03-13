const express = require("express");
const router = express.Router();
const {
  getTweet,
  getTweetsByUser,
  postTweet,
  addLike,
  removeLike,
  retweet,
  undoRetweet,
  findTweet,
  getAnswers,
  postAnswer,
} = require("../controllers/tweets");

const Tweet = require("../models/tweets");

const {
  parseUserFromBody,
  parseUserFromQuery,
} = require("../controllers/users");

// GET tweets for a specific user
router.get("/", parseUserFromQuery, getTweetsByUser);

//get a Tweet by id
router.get("/:id", findTweet, getTweet);

//get Answers for a tweet
router.get("/answers/:parentId", getAnswers);

//Post a new tweet
router.post("/", parseUserFromBody, postTweet);

//Post a new answer
router.post("/answers/:parentId", parseUserFromBody, postAnswer);

//like/unline routes
router.post("/:id/likes", parseUserFromQuery, findTweet, addLike);
router.delete("/:id/likes", parseUserFromQuery, findTweet, removeLike);

//retweet/undo retweet routes

router.post("/:id/retweet", parseUserFromQuery, findTweet, retweet);
router.delete("/:id/retweet", parseUserFromQuery, findTweet, undoRetweet);

module.exports = router;
