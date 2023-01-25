const dbAdapter = require("../db/dbAdapter");

const Tweet = require("../models/tweets");

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

function postTweet(req, res, next) {
  const { userId, newTweet } = req.body;

  if (!newTweet || !userId) {
    throw new Error("Request missing mandatory parameters");
  }

  dbAdapter
    .saveTweet(userId, newTweet)
    .then((tweet) => res.json({ success: true, ...tweet }))
    .catch(next);
}

function postAnswer(req, res, next) {
  const { parentId } = req.params;
  const { userId, newTweet } = req.body;

  if (!newTweet || !userId) {
    throw new Error("Request missing mandatory parameters");
  }

  const saveTweetPromise = dbAdapter.saveTweet(userId, newTweet, parentId);

  const updateTweetPromise = saveTweetPromise.then(() =>
    dbAdapter.getTweetById(parentId)
  );

  Promise.all([saveTweetPromise, updateTweetPromise])
    .then(([tweet, updatedTweet]) =>
      res.json({ success: true, updatedTweet, ...tweet })
    )
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

  const { like } = req.body;
  const { userId, tweetData } = req;
  const { tweetContent } = tweetData;

  if (like == null) {
    throw new Error("A value must be informed for like");
  }

  dbAdapter
    .repeatedLike(userId, tweetContent.id)
    .then((isLiked) => {
      return like
        ? removeLike(userId, tweetContent, isLiked)
        : addLike(userId, tweetContent, isLiked);
    })
    .then(() => {
      res.json({ success: true, updatedTweet: tweetContent });
    })
    .catch(next);
}

function addLike(userId, tweetContent, isLiked) {
  if (isLiked) {
    throw new Error(`User ${userId} has already liked this tweet`);
  }

  return dbAdapter.addLike(userId, tweetContent.id).then(() => {
    tweetContent.liked_by.push(userId);
  });
}

function removeLike(userId, tweetContent, isLiked) {
  if (!isLiked) {
    throw new Error(`User ${userId} has not liked this tweet`);
  }

  return dbAdapter.removeLike(userId, tweetContent.id).then(() => {
    tweetContent.liked_by = tweetContent.liked_by.filter((id) => id != userId);
  });
}

function findTweet(req, res, next) {
  //middleware to find a tweet. Adds it to the tweet property of the req.
  //responds with a 404 error if no tweet is found with the id informed in the url

  const { id } = req.params;

  Tweet.findByPk(id)
    .then((tweet) => {
      req.tweet = tweet;
      next();
    })
    .catch(next);
}

function getAnswers(req, res, next) {
  const { parentId } = req.params;

  dbAdapter
    .getTweetsByParentId(parentId)
    .then((tweetData) =>
      res.json({
        success: true,
        tweets: tweetData.tweets,
        tweetContent: tweetData.tweetContent,
      })
    )
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
