const User = require("../models/users");
const { Tweet, TWEET_TYPES } = require("../models/tweets");
const Likes = require("../models/likes");

function getTweetsByUser(req, res, next) {
  const { user } = req;

  user
    .getTweets({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Tweet,
          as: "retweets",
          attributes: ["authorId"],
          where: {
            type: "retweet",
          },
          required: false,
        },
        {
          model: Tweet,
          as: "comments",
          attributes: ["authorId"],
          where: {
            type: "comment",
          },
          required: false,
        },
        {
          model: Tweet,
          as: "answers",
          attributes: ["authorId"],
          where: {
            type: "answer",
          },
          required: false,
        },
        {
          model: User,
          as: "likers",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    })
    .then((tweets) => {
      res.json({
        success: true,
        tweets,
      });
    })
    .catch(next);
}

function getTweet(req, res) {
  //return a tweet made by an user. Searching work is done my the middleware findTweet. Responds with an object that contains the tweet

  const { tweet } = req;

  res.json({ success: true, tweet });
}

function postTweet(req, res, next) {
  const { newTweet } = req.body;
  const { user } = req;

  if (!newTweet) {
    throw new Error("Request must contain the new tweet data");
  }

  const { message, attachment, poll } = newTweet;

  user
    .createTweet({
      message,
      attachment,
      poll,
    })
    .then((result) => {
      const { dataValues } = result;
      res.json({ success: true, tweet: dataValues });
    })
    .catch(next);
}

function getAnswers(req, res, next) {
  const { parentId } = req.params;

  Tweet.findAll({
    where: {
      referenceId: parentId,
      type: TWEET_TYPES.ANSWER,
    },
  })
    .then((tweets) => {
      res.json({
        success: true,
        tweets,
      });
    })
    .catch(next);
}

function postAnswer(req, res, next) {
  const { user } = req;
  const { parentId } = req.params;
  const { newTweet } = req.body;

  if (!newTweet) {
    throw new Error("Request missing mandatory parameters");
  }

  const { message, attachment, poll } = newTweet;

  //todo extract tweet finding logic
  Tweet.findByPk(parentId)
    .then((parentTweet) => {
      return parentTweet.createAnswer({
        authorId: user.id,
        type: TWEET_TYPES.ANSWER,
        message,
        attachment,
        poll,
      });
    })
    .then((result) => {
      const { dataValues } = result;
      res.json({ success: true, tweet: { ...dataValues } });
    })
    .catch(next);
}

function retweet(req, res, next) {
  const { user, tweet } = req;

  Tweet.findOne({
    where: {
      authorId: user.id,
      referenceId: tweet.id,
      type: TWEET_TYPES.RETWEET,
    },
  })
    .then((retweet) => {
      if (retweet)
        throw new Error(`User ${user.id} already retweeted ${tweet.id}`);

      return Tweet.create({
        authorId: user.id,
        type: TWEET_TYPES.RETWEET,
        message: "",
      });
    })
    .then((retweet) => {
      return retweet.setReference(tweet);
    })
    .then((result) => {
      const { dataValues } = result;
      res.json({ success: true, tweet: { ...dataValues } });
    })
    .catch(next);
}

function undoRetweet(req, res, next) {
  //Remove the user from the list of retweeters. Responds with the updated tweet as an object.
  //Needs to be improved to effectively remove a retweet object from the list of objects
  const { user, tweet } = req;

  Tweet.findOne({
    where: {
      authorId: user.id,
      referenceId: tweet.id,
      type: TWEET_TYPES.RETWEET,
    },
  })
    .then((retweet) => {
      if (!retweet) throw new Error("Retweet not found");
      return retweet.destroy();
    })
    .then((result) => {
      res.json({ success: true });
    })
    .catch(next);
}

function addComment(req, res, next) {
  const { user, tweet } = req;
  const { newTweet } = req.body;

  if (!newTweet) {
    throw new Error("Request must contain the comment data");
  }

  const { message, attachment } = newTweet;

  Tweet.create({
    authorId: user.id,
    type: TWEET_TYPES.COMMENT,
    message,
    attachment,
  })
    .then((comment) => {
      return comment.setReference(tweet);
    })
    .then((result) => {
      const { dataValues } = result;
      res.json({ success: true, comment: { ...dataValues } });
    })
    .catch(next);
}

function addLike(req, res, next) {
  const { user, tweet } = req;

  tweet
    .addLiker(user)
    .then((result) => {
      if (!result)
        throw new Error(`User ${user.id} already liked tweet ${tweet.id}`);

      const { dataValues } = result[0];
      return dataValues;
    })
    .then((like) => {
      res.json({ success: true, like });
    })
    .catch(next);
}

function removeLike(req, res, next) {
  const { user, tweet } = req;

  tweet
    .removeLiker(user)
    .then((result) => {
      if (result === 0)
        throw new Error(`User ${user.id} didn't like ${tweet.id}`);

      res.json({ success: true });
    })
    .catch(next);
}

function findTweet(req, res, next) {
  //middleware to find a tweet. Adds it to the tweet property of the req.
  //responds with a 404 error if no tweet is found with the id informed in the url

  const { id } = req.params;

  Tweet.findByPk(id, {
    include: [
      {
        model: Tweet,
        as: "retweets",
        attributes: ["authorId"],
        where: {
          type: "retweet",
        },
        required: false,
      },
      {
        model: Tweet,
        as: "comments",
        attributes: ["authorId"],
        where: {
          type: "comment",
        },
        required: false,
      },
      {
        model: Tweet,
        as: "answers",
        attributes: ["authorId"],
        where: {
          type: "answer",
        },
        required: false,
      },
      {
        model: User,
        as: "likers",
        attributes: ["id"],
        through: { attributes: [] },
      },
    ],
  })
    .then((tweet) => {
      if (!tweet) throw new Error(`Tweet ${id} not found`);

      req.tweet = tweet;
      next();
    })
    .catch(next);
}

module.exports = {
  getTweetsByUser,
  getTweet,
  postTweet,
  addLike,
  removeLike,
  retweet,
  undoRetweet,
  addComment,
  findTweet,
  getAnswers,
  postAnswer,
};
