const express = require("express");
const { routes } = require("../app");
const router = express.Router();
const {
  getUserTweets,
  getTweet,
  postTweet,
  like,
  answer,
  retweet,
} = require("../controllers/tweets");

//Post a new tweet
router.post("/", postTweet);

//get Tweets from a user
router.get("/user/:id", getUserTweets);

//get a Tweet by id
router.get("/:id", getTweet);

//answer route

router.post("/:id/answer", answer);

//retweet route

routes.post("/:id/retweet", retweet);

//comment route

//routes.post("/:id/comment", comment);

//like route
router.put("/:id/like", like);

module.exports = router;
