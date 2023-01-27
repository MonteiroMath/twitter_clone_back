const express = require("express");
const router = express.Router();
const {
  getTweet,
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
  verifyUser,
  parseUserFromBody,
  parseUserFromQuery,
} = require("../controllers/users");

//get a Tweet by id
router.get("/:id", findTweet, getTweet);

//get Answers for a tweet
router.get("/answers/:parentId", getAnswers);

//Post a new tweet
router.post("/", postTweet);

//Post a new answer
router.post("/answers/:parentId", parseUserFromBody, postAnswer);

//like route
router.post("/:id/likes", parseUserFromQuery, findTweet, addLike);
router.delete("/:id/likes", parseUserFromQuery, findTweet, removeLike);

//retweet route

router.post("/:id/retweet", verifyUser, findTweet, retweet);

//undo retweet route

router.delete("/:id/retweet", verifyUser, findTweet, undoRetweet);

module.exports = router;
