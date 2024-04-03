const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/checkAuth");

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
router.get("/", checkAuth, parseUserFromQuery, getTweetsByUser);

//get a Tweet by id
router.get("/:id", parseUserFromQuery, findTweet, getTweet);
router.get(
  "/:id/reference",
  checkAuth,
  parseUserFromQuery,
  findTweet,
  getReference
);

//Post a new tweet
router.post("/", checkAuth, parseUserFromBody, postTweet);

//get Answers for a tweet
router.get("/:id/answers/", parseUserFromQuery, findTweet, getAnswers);
//Post a new answer
router.post(
  "/:id/answers/",
  checkAuth,
  parseUserFromBody,
  findTweet,
  postAnswer
);

//like/unline routes
router.post("/:id/likes", checkAuth, parseUserFromQuery, findTweet, addLike);
router.delete(
  "/:id/likes",
  checkAuth,
  parseUserFromQuery,
  findTweet,
  removeLike
);

router.post(
  "/:id/likes/rt",
  checkAuth,
  parseUserFromQuery,
  findTweet,
  addLikeRT
);
router.delete(
  "/:id/likes/rt",
  checkAuth,
  parseUserFromQuery,
  findTweet,
  removeLikeRT
);

//retweet/undo retweet routes

router.post("/:id/retweet", checkAuth, parseUserFromQuery, findTweet, retweet);
router.delete(
  "/:id/retweet",
  checkAuth,
  parseUserFromQuery,
  findTweet,
  undoRetweet
);

//comment route

router.post(
  "/:id/comments",
  checkAuth,
  parseUserFromQuery,
  findTweet,
  addComment
);

module.exports = router;
