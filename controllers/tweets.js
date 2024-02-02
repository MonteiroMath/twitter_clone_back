require("../models/likes");
const { Tweet, TWEET_TYPES } = require("../models/tweets");

const { includeOptions, getPopulatedTweet } = require("./utils/tweetUtils");

function getTweetsByUser(req, res, next) {
  const { user } = req;

  req.session.cookie.test = "yes";
  user
    .getTweets({
      limit: 10,
      subQuery: false,
      order: [["createdAt", "DESC"]],
      include: "reference",
      attributes: {
        include: includeOptions(user.id),
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

function getTweet(req, res) {
  const { tweet } = req;
  res.json({ success: true, tweet });
}

function getReference(req, res, next) {
  const { user, tweet } = req;

  if (!tweet.referenceId) throw new Error("Tweet has no reference.");
  tweet
    .getReference({
      attributes: {
        include: includeOptions(user.id),
      },
    })
    .then((dataValues) => {
      res.json({
        success: true,
        tweet: { ...tweet.toJSON(), reference: dataValues },
      });
    })
    .catch(next);
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
    .then(({ dataValues: tweet }) => getPopulatedTweet(tweet.id, user.id))
    .then((tweet) => res.json({ success: true, tweet }))
    .catch(next);
}

function getAnswers(req, res, next) {
  const { user } = req;
  const { id } = req.params;

  console.log(id);

  Tweet.findAll({
    where: {
      referenceId: id,
      type: TWEET_TYPES.ANSWER,
    },
    attributes: {
      include: includeOptions(user.id),
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
  const { user, tweet } = req;
  const { newTweet } = req.body;

  if (!newTweet) {
    throw new Error("Request missing mandatory parameters");
  }

  const { message, attachment, poll } = newTweet;

  tweet
    .createAnswer({
      authorId: user.id,
      type: TWEET_TYPES.ANSWER,
      message,
      attachment,
      poll,
    })
    .then(({ dataValues: answer }) =>
      Promise.all([
        getPopulatedTweet(tweet.id, user.id),
        getPopulatedTweet(answer.id, user.id),
      ])
    )
    .then(([updatedTweet, tweet]) =>
      res.json({ success: true, updatedTweet, tweet })
    )
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
    .then((retweet) => retweet.setReference(tweet))
    .then(({ dataValues: retweet }) =>
      Promise.all([
        getPopulatedTweet(tweet.id, user.id),
        getPopulatedTweet(retweet.id, user.id),
      ])
    )
    .then(([updatedTweet, retweet]) =>
      res.json({ success: true, updatedTweet, tweet: retweet })
    )
    .catch(next);
}

function undoRetweet(req, res, next) {
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
    .then(() => getPopulatedTweet(tweet.id, user.id))
    .then((updatedTweet) => res.json({ success: true, updatedTweet }))
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
    .then((comment) => comment.setReference(tweet))
    .then(({ dataValues: comment }) =>
      Promise.all([
        getPopulatedTweet(tweet.id, user.id),
        getPopulatedTweet(comment.id, user.id),
      ])
    )
    .then(([updatedTweet, tweet]) =>
      res.json({ success: true, updatedTweet, tweet })
    )
    .catch(next);
}

function addLike(req, res, next) {
  const { user, tweet } = req;

  tweet
    .addLiker(user)
    .then((result) => {
      if (!result)
        throw new Error(`User ${user.id} already liked tweet ${tweet.id}`);

      return getPopulatedTweet(tweet.id, user.id);
    })
    .then((updatedTweet) => res.json({ success: true, updatedTweet }))
    .catch(next);
}

function removeLike(req, res, next) {
  const { user, tweet } = req;

  tweet
    .removeLiker(user)
    .then((result) => {
      if (result === 0)
        throw new Error(`User ${user.id} didn't like ${tweet.id}`);

      return getPopulatedTweet(tweet.id, user.id);
    })
    .then((updatedTweet) => res.json({ success: true, updatedTweet }))
    .catch(next);
}

function addLikeRT(req, res, next) {
  const { user, tweet } = req;

  /*
    - get tweet reference
    - like reference
    - get updated reference
    - return updated tweet and updated reference

  */

  if (!tweet.referenceId) throw new Error("Tweet has no reference.");

  tweet
    .getReference({
      attributes: {
        include: includeOptions(user.id),
      },
    })
    .then((reference) => reference.addLiker(user))
    .then((result) => {
      if (!result)
        throw new Error(
          `User ${user.id} already liked tweet ${tweet.referenceId}`
        );

      return getPopulatedTweet(tweet.referenceId, user.id);
    })
    .then((updatedReference) =>
      res.json({
        success: true,
        updatedTweet: { ...tweet.toJSON(), reference: updatedReference },
        updatedReference,
      })
    )
    .catch(next);

  return;
}

function removeLikeRT(req, res, next) {
  const { user, tweet } = req;

  if (!tweet.referenceId) throw new Error("Tweet has no reference.");

  tweet
    .getReference({
      attributes: {
        include: includeOptions(user.id),
      },
    })
    .then((reference) => reference.removeLiker(user))
    .then((result) => {
      if (!result)
        throw new Error(
          `User ${user.id} had not liked tweet ${tweet.referenceId}`
        );

      return getPopulatedTweet(tweet.referenceId, user.id);
    })
    .then((updatedReference) =>
      res.json({
        success: true,
        updatedTweet: { ...tweet.toJSON(), reference: updatedReference },
        updatedReference,
      })
    )
    .catch(next);
}

function findTweet(req, res, next) {
  //middleware to find a tweet. Adds it to the tweet property of the req.
  //responds with a 404 error if no tweet is found with the id informed in the url

  const { user } = req;
  const { id } = req.params;

  if (!user) throw new Error("An user id must be informed");

  getPopulatedTweet(id, user.id)
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
  getReference,
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
};
