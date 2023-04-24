const express = require("express");
const router = express.Router();
const {
  getTweet,
  getReference,
  getTweetsByUser,
  postTweet,
  addLike,
  removeLike,
  addLikeRT,
  removeLikeRT,
  retweet,
  undoRetweet,
  addComment,
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
router.get("/:id", parseUserFromQuery, findTweet, getTweet);
router.get("/:id/reference", parseUserFromQuery, findTweet, getReference);

//Post a new tweet
router.post("/", parseUserFromBody, postTweet);

//get Answers for a tweet
router.get("/:id/answers/", parseUserFromQuery, getAnswers);
//Post a new answer
router.post("/:id/answers/", parseUserFromBody, findTweet, postAnswer);

//like/unline routes
router.post("/:id/likes", parseUserFromQuery, findTweet, addLike);
router.delete("/:id/likes", parseUserFromQuery, findTweet, removeLike);

router.post("/:id/likes/rt", parseUserFromQuery, findTweet, addLikeRT);
router.delete("/:id/likes/rt", parseUserFromQuery, findTweet, removeLikeRT);

//retweet/undo retweet routes

router.post("/:id/retweet", parseUserFromQuery, findTweet, retweet);
router.delete("/:id/retweet", parseUserFromQuery, findTweet, undoRetweet);

//comment route

router.post("/:id/comments", parseUserFromBody, findTweet, addComment);

module.exports = router;
