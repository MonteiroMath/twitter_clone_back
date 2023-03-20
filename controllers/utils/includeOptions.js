const Sequelize = require("sequelize");
const { TWEET_TYPES } = require("../../models/tweets");

module.exports = (userId) => [
  [
    Sequelize.literal(
      `(SELECT COUNT(*) FROM tweets AS retweets WHERE retweets.referenceId=tweet.id AND retweets.type='${TWEET_TYPES.RETWEET}')`
    ),
    "retweetsCount",
  ],
  [
    Sequelize.literal(
      `(SELECT COUNT(*) FROM tweets AS comments WHERE comments.referenceId=tweet.id AND comments.type='${TWEET_TYPES.COMMENT}')`
    ),
    "commentsCount",
  ],
  [
    Sequelize.literal(
      `(SELECT COUNT(*) FROM tweets AS answers WHERE answers.referenceId=tweet.id AND answers.type='${TWEET_TYPES.ANSWER}')`
    ),
    "answersCount",
  ],
  [
    Sequelize.literal(
      "(SELECT COUNT(*) FROM likes WHERE likes.tweetId=tweet.id)"
    ),
    "likesCount",
  ],
  [
    Sequelize.literal(
      `(SELECT EXISTS(SELECT * FROM likes WHERE likes.userId=${userId} AND likes.tweetId=tweet.id))`
    ),
    "liked",
  ],
  [
    Sequelize.literal(
      `(SELECT EXISTS(SELECT * FROM tweets WHERE tweets.authorId=${userId} AND tweets.referenceId=tweet.id AND tweets.type='retweet'))`
    ),
    "retweeted",
  ],
];
