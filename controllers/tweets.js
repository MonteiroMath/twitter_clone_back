const { default: tweets } = require("../../twitter/src/placeholders/tweets");

const tweets_ph = [
  {
    id: 0,
    author: 1,
    created: new Date().getTime(),
    message: "This is my first tweet, hi everyone",
    likes: 3,
    liked_by: [],
    retweeted_by: [],
    comment_ids: [1],
    retweets: 0,
    comments: 0,
    attach: "/images/phattach.jpeg",
    poll: false,
    pollSettings: {},
    retweet: {
      id: 0,
      author: 1,
      created: new Date().getTime(),
      message: "This is my first tweet, hi everyone",
      likes: 3,
      retweets: 0,
      comments: 0,
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
    likes: 3,
    retweets: 0,
    liked_by: [],
    retweeted_by: [],
    comment_ids: [],
    comments: 0,
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
    likes: 3,
    retweets: 0,
    liked_by: [],
    retweeted_by: [],
    comment_ids: [],
    comments: 0,
    attach: "",
    poll: false,
    pollSettings: {},
    retweet: {
      id: 0,
      author: 1,
      created: new Date().getTime(),
      message: "This is my first tweet, hi everyone",
      likes: 3,
      retweets: 0,
      comments: 0,
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
    likes: 3,
    retweets: 0,
    liked_by: [],
    retweeted_by: [],
    comment_ids: [],
    comments: 0,
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
    likes: 3,
    retweets: 0,
    liked_by: [],
    retweeted_by: [],
    comment_ids: [],
    comments: 0,
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
  const tweets = tweets_ph.filter((tweet) => tweet.author == id);
  const { id } = req.params;

  if (tweets.length === 0) {
    return res
      .status(404)
      .json({ success: false, msg: `No tweets found for user ${id}` });
  }

  res.json({ success: true, tweets });
}

function getTweet(req, res) {
  const { id } = req.params;
  const tweet = tweets_ph.find(tweet.id === id);

  if (!tweet) {
    return res
      .status(404)
      .json({ success: false, msg: `Tweet ${id} not found` });
  }

  res.json(tweet);
}

function postTweet(req, res) {
  /* get the new tweet content from the body of the requirement. As a placeholder, uses lenght as id.
FUnction create NewTweet formats the new tweet. Return the newly registered tweet.
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

function answer(req, res) {
  return;
}

function retweet(req, res) {
  return;
}

function like(req, res) {
  
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ sucess: false, msg: "The user id must be informed" });
  }

  let tweet = tweets_ph.find((tweet) => tweet.id === id);

  if (!tweet) {
    return res
      .status(404)
      .json({ success: false, msg: `Tweet ${id} not found.` });
  }

  if (tweet.liked_by.includes(userId)) {
    return res
      .status(400)
      .json({ success: false, msg: `User ${userId} already liked this tweet` });
  }

  tweet.liked_by.push(userId);

  res.json({ success: true, tweet });
}

//move to utility function

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
  like,
  answer,
  retweet,
};
