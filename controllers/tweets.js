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

function getUserTweets(req, res) {
  //Gets tweets made by an user, returns an array containing the tweets

  const { id } = req.params;
  const tweets = tweets_ph.filter((tweet) => tweet.author === parseInt(id));

  if (tweets.length === 0) {
    return res
      .status(404)
      .json({ success: false, msg: `No tweets found for user ${id}` });
  }

  res.json({ success: true, tweets });
}

function getTweet(req, res) {
  //return a tweet made by an user. Searching work is done my the middleware findTweet. Responds with an object that contains the tweet

  const { tweet } = req;
  res.json(tweet);
}

function postTweet(req, res) {
  /* get the new tweet content from the body of the requirement. As a placeholder, uses lenght as id.
FUnction create NewTweet formats the new tweet. Responds with the newly registered tweet as an object.
*/

  const { newTweet } = req.body;

  if (!newTweet) {
    return res.status(400).json({
      success: false,
      msg: "The content of the new tweet must be sent",
    });
  }

  let tt_count = tweets_ph.length;

  let tweet = createNewTweet(tt_count + 1, newTweet);

  tweets_ph.push(tweet);

  res.json({ success: true, tweet });
}

function updateTweet(req, res) {
  const { tweet } = req;
  const { updatedTweet } = req.body;
}

function retweet(req, res) {
  //add the user to the list of retweeters of the tweet. Responds with the updated tweet as an object
  //Function needs to be improved to effectively include a retweet object into the list of objects

  const { userId, tweet } = req;

  if (tweet.retweeted_by.includes(userId)) {
    return res.status(400).json({
      success: false,
      msg: `User ${userId} already retweet this tweet`,
    });
  }

  let tt_count = tweets_ph.length;
  let retweet = {
    id: 10000 + tt_count + 1,
    author: 1,
    created: new Date().getTime(),
    tweetId: tweet.id,
  };

  tweet.retweeted_by.push(userId);
  tweets_ph.push(retweet);

  res.json({ success: true, updatedTweet: tweet, retweet });
}

function undoRetweet(req, res) {
  //Remove the user from the list of retweeters. Responds with the updated tweet as an object.
  //Needs to be improved to effectively remove a retweet object from the list of objects
  const { userId, tweet } = req;

  if (!tweet.retweeted_by.includes(userId)) {
    return res.status(400).json({
      success: false,
      msg: `User ${userId} has not retweeted this tweet`,
    });
  }

  tweet.retweeted_by = tweet.retweeted_by.filter((id) => userId !== id);

  res.json({ success: true, tweet });
}

function answer(req, res) {
  // Creates a new tweet representing the answer to a previous tweet.
  // Includes the id of the answer into the comment_ids property of the old tweet
  // Responds with both the old tweet, updated, and the answer as objects

  const { tweet } = req;
  const { newTweet } = req.body;

  let tt_count = tweets_ph.length;
  let answer = createNewTweet(tt_count + 1, newTweet);

  tweets_ph.push(answer);
  tweet.comment_ids.push(answer.id);

  res.json({ success: true, old_tweet: tweet, answer });
}

function handleLike(req, res) {
  //Includes the userId in the liked_by property of the tweet
  //Responds with the updated tweet as an object

  const { userId, tweet } = req;
  const { like } = req.body;

  if (like == null) {
    return res.status(400).json({
      success: false,
      msg: "A value must be informed for like",
    });
  }

  const userAlreadyLikes = tweet.liked_by.includes(userId);

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
    tweet.liked_by.push(userId);
  } else {
    tweet.liked_by = tweet.liked_by.filter((id) => id !== userId);
  }

  res.json({ success: true, tweet });
}

function findTweet(req, res, next) {
  //middleware to find a tweet. Adds it to the tweet property of the req.
  //responds with a 404 error if no tweet is found with the id informed in the url

  const { id } = req.params;
  const tweet = findTweetById(id);

  if (!tweet) {
    return res
      .status(404)
      .json({ success: false, msg: `Tweet ${id} not found` });
  }

  req.tweet = tweet;
  next();
}

function findTweetById(id) {
  //utilify function that searchs for a tweet by its id
  return tweets_ph.find((tweet) => tweet.id === parseInt(id));
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
  answer,
  retweet,
  undoRetweet,
  findTweet,
};
