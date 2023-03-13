const User = require("../models/users");
const { Tweet, TWEET_TYPES } = require("../models/tweets");
const Likes = require("../models/likes");

function getTweetsByUser(req, res, next) {
  const { user } = req;

  //todo review both includes - at least one is wrong, maybe both

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

//todo extracted user querying logic
function postTweet(req, res, next) {
  const { userId, newTweet } = req.body;
  if (!newTweet || !userId) {
    throw new Error("Request missing mandatory parameters");
  }

  const { message, attachment, poll } = newTweet;

  User.findByPk(userId)
    .then((user) => {
      if (!user) throw new Error(`User ${userId} not found`);

      return user.createTweet({
        message,
        attachment,
        poll,
      });
    })
    .then((result) => {
      const { dataValues } = result;
      res.json({ success: true, tweet: dataValues });
    })
    .catch(next);
}

//todo Requires testing
function postAnswer(req, res, next) {
  const { user } = req;
  const { parentId } = req.params;
  const { newTweet } = req.body;

  if (!newTweet) {
    throw new Error("Request missing mandatory parameters");
  }

  const { message, attachment, poll } = newTweet;

  Tweet.findByPk(parentId)
    .then((parentTweet) => {
      return parentTweet.createReference({
        authorId: user.id,
        type: "answer",
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
  /*
    Create a new tweet on the tweets table
    tweet has the retweeet prop set to 1 and content set to a tweet that already exists
    return the new tweet
  */

  const { user, tweet } = req;

  Tweet.findOne({
    where: {
      authorId: user.id,
      referenceId: tweet.id,
      type: "retweet",
    },
  })
    .then((retweet) => {
      if (retweet)
        throw new Error(`User ${user.id} already retweeted ${tweet.id}`);

      return Tweet.create({
        authorId: user.id,
        type: "retweet",
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
      type: "retweet",
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

  Tweet.findByPk(id)
    .then((tweet) => {
      if (!tweet) throw new Error(`Tweet ${id} not found`);

      req.tweet = tweet;
      next();
    })
    .catch(next);
}

//todo Requires testing
function getAnswers(req, res, next) {
  const { parentId } = req.params;

  Tweet.findAll({
    where: {
      referenceId: parentId,
      type: "answer",
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

module.exports = {
  getTweetsByUser,
  getTweet,
  postTweet,
  addLike,
  removeLike,
  retweet,
  undoRetweet,
  findTweet,
  getAnswers,
  postAnswer,
};
