const {
  getTweets,
  getTweetById,
  saveTweet,
  repeatedLike,
  addLike,
  removeLike,
  repeatedRetweet,
  postRetweet,
  deleteRetweet,
} = require("../db/dbAdapter");

const tweets_ph = [
  {
    id: 0,
    author: 1,
    created: new Date().getTime(),
    message: "This is my first tweet, hi everyone",
    liked_by: [],
    retweeted_by: [],
    comment_ids: [1],
    attach: "/images/phattach.jpeg",
    poll: false,
    pollSettings: {},
    retweet: {
      id: 0,
      author: 1,
      created: new Date().getTime(),
      message: "This is my first tweet, hi everyone",
      attach: "/images/phattach.jpeg",
      poll: false,
      pollSettings: {},
    },
  },
  {
    id: 1,
    author: 1,
    created: new Date().getTime(),
    message: "This is my second tweet lol getting good at this",
    liked_by: [],
    retweeted_by: [],
    comment_ids: [],
    attach: "",
    poll: false,
    pollSettings: {},
    retweet: null,
  },
  {
    id: 2,
    author: 1,
    created: new Date().getTime(),
    message: "Ok it is getting harder now",
    liked_by: [],
    retweeted_by: [],
    comment_ids: [],
    attach: "",
    poll: false,
    pollSettings: {},
    retweet: {
      id: 0,
      author: 1,
      created: new Date().getTime(),
      message: "This is my first tweet, hi everyone",
      attach: "/images/phattach.jpeg",
      poll: false,
      pollSettings: {},
    },
  },
  {
    id: 3,
    author: 1,
    created: new Date().getTime(),
    message: "Hate the character limit, anyone with me?",
    liked_by: [],
    retweeted_by: [],
    comment_ids: [],
    attach: "",
    poll: false,
    pollSettings: {},
    retweet: null,
  },
  {
    id: 4,
    author: 1,
    created: new Date().getTime(),
    message: "How do you win at this",
    liked_by: [],
    retweeted_by: [],
    comment_ids: [],
    attach: "",
    poll: true,
    pollSettings: {
      choices: [
        { text: "Yes I do", votes: 1 },
        { text: "No I don't", votes: 5 },
      ],
      pollLen: {
        days: 1,
        hours: 3,
        minutes: 35,
      },
    },
    retweet: null,
  },
  {
    id: 101,
    author: 1,
    created: new Date().getTime(),
    tweetId: 3,
  },
];

function sendNotFoundError(res, msg) {
  return res.status(404).json({ success: false, msg });
}

async function getUserTweets(req, res, next) {
  const { id } = req.params;

  const tweetData = await getTweets(id);

  if (tweetData.tweets.length === 0) {
    return sendNotFoundError(res, `No tweets found for user ${id}`);
  }

  res.json({
    success: true,
    tweets: tweetData.tweets,
    tweetContent: tweetData.tweetContent,
  });
}

function getTweet(req, res) {
  //return a tweet made by an user. Searching work is done my the middleware findTweet. Responds with an object that contains the tweet

  const { tweet } = req;
  res.json(tweet);
}

async function postTweet(req, res, next) {
  const { userId, newTweet } = req.body;

  if (!newTweet) {
    return res.status(400).json({
      success: false,
      msg: "The content of the new tweet must be sent",
    });
  }

  try {
    const tweet = await saveTweet(userId, newTweet);

    res.json({ success: true, ...tweet });
  } catch (err) {
    next(err);
  }
}

async function retweet(req, res) {
  //add the user to the list of retweeters of the tweet. Responds with the updated tweet as an object
  //Function needs to be improved to effectively include a retweet object into the list of objects

  const { userId, tweet } = req;

  const userAlreadyRetweeted = await repeatedRetweet(userId, tweet.id);

  if (userAlreadyRetweeted) {
    return res.status(400).json({
      success: false,
      msg: `User ${userId} already retweet this tweet`,
    });
  }

  newRetweet = await postRetweet(userId, tweet.id);

  tweet.retweeted_by.push(userId);

  res.json({ success: true, updatedTweet: tweet, retweet: newRetweet });
}

async function undoRetweet(req, res) {
  //Remove the user from the list of retweeters. Responds with the updated tweet as an object.
  //Needs to be improved to effectively remove a retweet object from the list of objects
  const { userId, tweet } = req;

  const userAlreadyRetweeted = await repeatedRetweet(userId, tweet.id);

  if (!userAlreadyRetweeted) {
    return res.status(400).json({
      success: false,
      msg: `User ${userId} has not retweeted this tweet`,
    });
  }

  await deleteRetweet(userId, tweet.id);
  tweet.retweeted_by = tweet.retweeted_by.filter((id) => userId !== id);

  res.json({ success: true, updatedTweet: tweet });
}

function comment(req, res) {
  // Creates a new tweet representing the answer to a previous tweet.
  // Includes the id of the answer into the comment_ids property of the old tweet
  // Responds with both the old tweet, updated, and the answer as objects

  const { tweet } = req;
  const { newTweet } = req.body;

  let tt_count = tweets_ph.length;
  let comment = createNewTweet(tt_count + 1, newTweet);

  tweets_ph.push(comment);
  tweet.comment_ids.push(comment.id);

  res.json({ success: true, updatedTweet: tweet, comment });
}

async function handleLike(req, res) {
  //Includes the userId in the liked_by property of the tweet
  //Responds with the updated tweet as an object

  const { userId, tweetData } = req;
  const { like } = req.body;
  const { tweet, tweetContent } = tweetData;

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

async function findTweet(req, res, next) {
  //middleware to find a tweet. Adds it to the tweet property of the req.
  //responds with a 404 error if no tweet is found with the id informed in the url

  const { id } = req.params;
  const tweetData = await getTweetById(id);

  if (!tweetData.tweet) {
    return sendNotFoundError(res, `Tweet ${id} not found`);
  }

  req.tweetData = tweetData;
  next();
}

function createNewTweet(id, content) {
  /*

    content: {
      message,
      attach,
      poll,
      retweet,
      pollSettings
    }

  */
  return {
    id,
    author: 1,
    created: new Date().getTime(),
    message: content.message,
    attach: content.attach,
    poll: content.poll,
    retweet: content.retweet,
    retweeted_by: [],
    liked_by: [],
    comment_ids: [],
    pollSettings: {
      choices: content.pollSettings.choices,
      pollLen: content.pollSettings.pollLen,
      votes: [0, 0],
    },
  };
}

module.exports = {
  getUserTweets,
  getTweet,
  postTweet,
  handleLike,
  retweet,
  comment,
  undoRetweet,
  findTweet,
};
