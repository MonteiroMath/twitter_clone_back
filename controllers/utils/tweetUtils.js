const Sequelize = require("sequelize");
const { Tweet, TWEET_TYPES } = require("../../models/tweets");
const User = require("../../models/users");

//define the include options for select queries on tweets
function includeOptions(userId) {
  return [
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
}
//wrapper around tweetFindByPk to get fully populated tweets.
function getPopulatedTweet(tweetId, userId) {
  return Tweet.findByPk(tweetId, {
    include: [
      {
        model: Tweet,
        as: "reference",
        include: {
          model: User,
          as: "author",
          attributes: ["id", "username", "avatar"],
        },
      },
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "avatar"],
      },
    ],
    attributes: {
      include: includeOptions(userId),
    },
  });
}

module.exports = {
  includeOptions,
  getPopulatedTweet,
};
