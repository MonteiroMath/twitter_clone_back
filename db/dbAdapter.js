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

  return { data: result };
}

async function getTweets(id) {
  const { data } = await executeQuery(
    "SELECT * FROM `twittertest` WHERE author=? ORDER BY id DESC LIMIT 10",
    [id]
  );

  const tweets = await Promise.all(
    data.map(async (tweet) => {
      const likes = await getLikes(tweet.id);
      tweet.liked_by = likes;
      tweet.retweeted_by = [];
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
    })
  );

  return tweets;
}

async function getTweetById(id) {
  const { data } = await executeQuery(
    "SELECT * FROM `twittertest` WHERE id=?",
    [id]
  );

  const tweet = data[0];
  const likes = await getLikes(id);

  tweet.liked_by = likes;
  tweet.retweeted_by = [];
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
  let { data } = await executeQuery(
    "INSERT INTO `twittertest` (author, message, attach, poll) VALUES(?, ?, ?, ?);",
    [author, content.message, content.attach, content.poll]
  );

  const { insertId } = data;

  return getTweetById(insertId);
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
