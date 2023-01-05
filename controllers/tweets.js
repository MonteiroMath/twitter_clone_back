const {
  getTweets,
  getTweetsByParentId,
  getTweetById,
  saveTweet,
  repeatedLike,
  addLike,
  removeLike,
  repeatedRetweet,
  postRetweet,
  deleteRetweet,
} = require("../db/dbAdapter");

function getUserTweets(req, res, next) {
  const { id } = req.params;

  getTweets(id)
    .then((tweetData) => {
      res.json({
        success: true,
        tweets: tweetData.tweets,
        tweetContent: tweetData.tweetContent,
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

  saveTweet(userId, newTweet)
    .then((tweet) => res.json({ success: true, ...tweet }))
    .catch(next);
}

function postAnswer(req, res, next) {
  const { parentId } = req.params;
  const { userId, newTweet } = req.body;

  if (!newTweet || !userId) {
    throw new Error("Request missing mandatory parameters");
  }

  const saveTweetPromise = saveTweet(userId, newTweet, parentId);

  const updateTweetPromise = saveTweetPromise.then(() =>
    getTweetById(parentId)
  );

  Promise.all([saveTweetPromise, updateTweetPromise])
    .then(([tweet, updatedTweet]) =>
      res.json({ success: true, updatedTweet, ...tweet })
    )
    .catch(next);
}

async function retweet(req, res) {
  /*

    Create a new tweet on the tweets table
    tweet has the retweeet prop set to 1 and content set to a tweet that already exists
    return the new tweet

  */

  const { userId, tweetData } = req;
  const { tweet, tweetContent } = tweetData;

  const userAlreadyRetweeted = await repeatedRetweet(userId, tweetContent.id);

  if (userAlreadyRetweeted) {
    return res.status(400).json({
      success: false,
      msg: `User ${userId} already retweeted this tweet`,
    });
  }

  const retweet = await postRetweet(userId, tweet.id, tweetContent.id);

  res.json({ success: true, ...retweet });
}

async function undoRetweet(req, res) {
  //Remove the user from the list of retweeters. Responds with the updated tweet as an object.
  //Needs to be improved to effectively remove a retweet object from the list of objects
  const { userId, tweetData } = req;
  const { tweetContent } = tweetData;

  const userAlreadyRetweeted = await repeatedRetweet(userId, tweetContent.id);

  if (!userAlreadyRetweeted) {
    return res.status(400).json({
      success: false,
      msg: `User ${userId} has not retweeted this tweet`,
    });
  }

  await deleteRetweet(userId, tweetContent.id);
  tweetContent.retweeted_by = tweetContent.retweeted_by.filter(
    (id) => userId !== id
  );

  res.json({ success: true, updatedTweet: tweetContent });
}

function handleLike(req, res, next) {
  //Includes the userId in the liked_by property of the tweet
  //Responds with the updated tweet as an object

  const { like } = req.body;
  const { userId, tweet } = req;
  const { tweetContent } = tweet;

  if (like == null) {
    throw new Error("A value must be informed for like");
  }

  repeatedLike(userId, tweetContent.id)
    .then((isLiked) => {
      return like
        ? removeLikePh(userId, tweetContent, isLiked)
        : addLikePh(userId, tweetContent, isLiked);
    })
    .then(() => {
      res.json({ success: true, updatedTweet: tweetContent });
    })
    .catch(next);
}

function addLikePh(userId, tweetContent, isLiked) {
  if (isLiked) {
    throw new Error(`User ${userId} has already liked this tweet`);
  }

  return addLike(userId, tweetContent.id).then(() => {
    tweetContent.liked_by.push(userId);
  });
}

function removeLikePh(userId, tweetContent, isLiked) {
  if (!isLiked) {
    throw new Error(`User ${userId} has not liked this tweet`);
  }

  return removeLike(userId, tweetContent.id).then(() => {
    tweetContent.liked_by = tweetContent.liked_by.filter((id) => id != userId);
  });
}

function findTweet(req, res, next) {
  //middleware to find a tweet. Adds it to the tweet property of the req.
  //responds with a 404 error if no tweet is found with the id informed in the url

  const { id } = req.params;

  getTweetById(id)
    .then((tweetData) => {
      req.tweet = tweetData;
      next();
    })
    .catch(next);
}

function getAnswers(req, res, next) {
  const { parentId } = req.params;

  getTweetsByParentId(parentId)
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
  getUserTweets,
  getTweet,
  postTweet,
  handleLike,
  retweet,
  undoRetweet,
  findTweet,
  getAnswers,
  postAnswer,
};
