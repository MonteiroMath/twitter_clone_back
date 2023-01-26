const dbAdapter = require("../db/dbAdapter");

const User = require("../models/users");
const Tweet = require("../models/tweets");
const Likes = require("../models/likes");

function getTweetsByUser(req, res, next) {
  const { user } = req;

  user
    .getTweets()
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

  const { userId, tweetData } = req;
  const { tweet, tweetContent } = tweetData;

  dbAdapter
    .repeatedRetweet(userId, tweetContent.id)
    .then((isRetweeted) => {
      if (isRetweeted) {
        throw new Error(`User ${userId} already retweeted this tweet`);
      }

      return dbAdapter.postRetweet(userId, tweet.id, tweetContent.id);
    })
    .then((retweet) => {
      res.json({ success: true, ...retweet });
    })
    .catch(next);
}

function undoRetweet(req, res, next) {
  //Remove the user from the list of retweeters. Responds with the updated tweet as an object.
  //Needs to be improved to effectively remove a retweet object from the list of objects
  const { userId, tweetData } = req;
  const { tweetContent } = tweetData;

  dbAdapter
    .repeatedRetweet(userId, tweetContent.id)
    .then((isRetweeted) => {
      if (!isRetweeted) {
        throw new Error(`User ${userId} has not retweeted this tweet`);
      }

      return dbAdapter.deleteRetweet(userId, tweetContent.id);
    })
    .then(() => {
      tweetContent.retweeted_by = tweetContent.retweeted_by.filter(
        (id) => userId !== id
      );

      res.json({ success: true, updatedTweet: tweetContent });
    })
    .catch(next);
}

function handleLike(req, res, next) {
  //Includes the userId in the liked_by property of the tweet
  //Responds with the updated tweet as an object

  const { user, tweet } = req;
  const { like } = req.body;

  if (like == null) {
    throw new Error("A value must be informed for like");
  }

  const operation = like ? addLike(user, tweet) : removeLike(user, tweet);

  operation
    .then((result) => {
      res.json({ success: true, like: result });
    })
    .catch(next);
}

function addLike(user, tweet) {
  return tweet.addLiker(user).then((result) => {
    if (!result)
      throw new Error(`User ${user.id} already liked tweet ${tweet.id}`);
    const { dataValues } = result[0];
    return dataValues;
  });
}

function removeLike(user, tweet) {
  return tweet.removeLiker(user).then((result) => {
    if (result === 0)
      throw new Error(`User ${user.id} didn't like ${tweet.id}`);

    return result;
  });
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
  handleLike,
  retweet,
  undoRetweet,
  findTweet,
  getAnswers,
  postAnswer,
};
