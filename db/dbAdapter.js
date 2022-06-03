const mysql = require("mysql2/promise");
const { getTweet } = require("../controllers/tweets");

//get tweet and post tweet

async function executeQuery(query, params) {
  const con = await mysql.createConnection({
    host: "localhost",
    user: process.env.DBUSER,
    password: process.env.PASSWORD,
    database: "twitter",
  });

  const [result, fields] = await con.execute(query, params);

  con.close();

  return { data: result };
}

async function getTweets(id) {
  /*

    - Buscar tweets pelo autor em Tweets
    - Buscar TweetContent dos tweets
    - Povoa o TweetContent
    - Retorna

  */

  const { data } = await executeQuery(
    "SELECT * FROM `tweets` WHERE author=? ORDER BY id DESC LIMIT 10",
    [id]
  );

  let contentPromises = data.map(async (tweet) => {
    const { data } = await executeQuery(
      "SELECT * FROM `tweetContent` WHERE id=?",
      [tweet.content]
    );

    const tweetContent = data[0];

    //extract as populateLikes()
    const likes = await getLikes(tweetContent.id);
    tweetContent.liked_by = likes;

    //extract as populateRetweets()
    const retweets = await getRetweets(tweetContent.id);
    tweetContent.retweeted_by = retweets.map((retweet) => retweet.user);

    tweetContent.comment_ids = [];
    tweetContent.pollSettings = {
      choices: ["hi", "ho"],
      pollLen: {
        days: 1,
        hours: 3,
        minutes: 35,
      },
    };

    return tweetContent;
  });

  let tweetContent = await Promise.all(contentPromises);

  return { tweets: data, tweetContent };
}

async function getTweetById(id) {
  const { data } = await executeQuery(
    "SELECT * FROM `twittertest` WHERE id=?",
    [id]
  );

  const tweet = data[0];
  const likes = await getLikes(id);
  const retweets = await getRetweets(id);

  tweet.liked_by = likes;
  tweet.retweeted_by = retweets.map((retweet) => retweet.user);
  tweet.comment_ids = [];
  tweet.pollSettings = {
    choices: ["hi", "ho"],
    pollLen: {
      days: 1,
      hours: 3,
      minutes: 35,
    },
  };

  return tweet;
}

async function saveTweet(author, content) {
  /*
    - Save Tweet Content
    - insert ID on tweet table
    - return both insertions
  */

  const tweetContent = await executeQuery(
    "INSERT INTO `tweetContent` (author, message, attach, poll) VALUES(?, ?, ?, ?);",
    [author, content.message, content.attach, content.poll]
  );

  const { insertId } = tweetContent.data;

  const tweet = await executeQuery(
    "INSERT INTO `tweets` (author, content) VALUES(?, ?)",
    [author, insertId]
  );

  const tweetId = tweet.data.insertId;

  return getTweetById(tweetId);
}

async function repeatedLike(author, tweet) {
  let { data } = await executeQuery(
    "SELECT EXISTS(SELECT * FROM `likes` WHERE user=? AND tweet=?)",
    [author, tweet]
  );

  const existenceCode = Object.values(data[0])[0];

  return existenceCode === 1;
}

async function addLike(author, tweet) {
  let { data } = await executeQuery(
    "INSERT INTO `likes` (user, tweet) VALUES(?, ?);",
    [author, tweet]
  );

  const { insertId } = data;

  return insertId;
}

async function removeLike(author, tweet) {
  let { data } = await executeQuery(
    "DELETE FROM `likes` WHERE user=? AND tweet=?;",
    [author, tweet]
  );
}

async function getLikes(tweet) {
  let { data } = await executeQuery("SELECT user FROM likes WHERE tweet=?", [
    tweet,
  ]);

  return data.map((like) => like.user);
}

async function repeatedRetweet(author, tweet) {
  let { data } = await executeQuery(
    "SELECT EXISTS(SELECT * FROM `retweets` WHERE user=? AND tweet=?)",
    [author, tweet]
  );

  const existenceCode = Object.values(data[0])[0];

  return existenceCode === 1;
}

async function getRetweets(tweetId) {
  const { data } = await executeQuery(
    "SELECT * FROM `retweets` WHERE tweet=?",
    [tweetId]
  );

  return data;
}

async function getRetweet(id) {
  const { data } = await executeQuery("SELECT * FROM `retweets` WHERE id=?", [
    id,
  ]);

  const retweet = data[0];

  const originalTweet = await getTweetById(retweet.tweet);

  retweet.tweet = originalTweet;

  return retweet;
}

async function postRetweet(author, tweet) {
  let { data } = await executeQuery(
    "INSERT INTO `retweets` (user, tweet) VALUES(?, ?);",
    [author, tweet]
  );

  const { insertId } = data;

  /* 
  Write a function getRetweet that returns the retweet with the tweet field populated
  */
  return getRetweet(insertId);
}

async function deleteRetweet(author, tweet) {
  let { data } = await executeQuery(
    "DELETE FROM `retweets` WHERE user=? AND tweet=?;",
    [author, tweet]
  );
}

module.exports = {
  getTweets,
  getTweetById,
  saveTweet,
  repeatedLike,
  addLike,
  removeLike,
  repeatedRetweet,
  postRetweet,
  deleteRetweet,
};
