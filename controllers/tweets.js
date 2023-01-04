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

async function postAnswer(req, res, next) {
  const { parentId } = req.params;
  const { userId, newTweet } = req.body;

  if (!newTweet) {
    return res.status(400).json({
      success: false,
      msg: "The content of the new tweet must be sent",
    });
  }

  try {
    const tweet = await saveTweet(userId, newTweet, parentId);
    console.log(tweet);
    const updatedTweet = await getTweetById(parentId);

    res.json({ success: true, updatedTweet, ...tweet });
  } catch (err) {
    next(err);
  }
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

async function handleLike(req, res) {
  //Includes the userId in the liked_by property of the tweet
  //Responds with the updated tweet as an object

  const { userId, tweetData } = req;
  const { like } = req.body;
  const { tweetContent } = tweetData;

  if (like == null) {
    return res.status(400).json({
      success: false,
      msg: "A value must be informed for like",
    });
  }

  const userAlreadyLikes = await repeatedLike(userId, tweetContent.id);

  if (like && userAlreadyLikes) {
    return res.status(400).json({
      success: false,
      msg: `User ${userId} has already liked this tweet`,
    });
  } else if (!like && !userAlreadyLikes) {
    return res.status(400).json({
      success: false,
      msg: `User ${userId} has not liked this tweet`,
    });
  }

  if (like) {
    result = await addLike(userId, tweetContent.id);
    tweetContent.liked_by.push(userId);
  } else {
    result = await removeLike(userId, tweetContent.id);
    tweetContent.liked_by = tweetContent.liked_by.filter((id) => id != userId);
  }

  res.json({ success: true, updatedTweet: tweetContent });
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
