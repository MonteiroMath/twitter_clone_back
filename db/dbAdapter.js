const mysql = require("mysql2/promise");

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
  //Busca tweets pelo autor em Tweets
  const { data } = await executeQuery(
    "SELECT * FROM `tweets` WHERE author=? ORDER BY id DESC LIMIT 10",
    [id]
  );

  //Busca TweetContent dos tweets
  tweetContent = await getTweetContent(data);

  return { tweets: data, tweetContent };
}

async function getTweetContent(tweets) {
  let contentPromises = tweets.map(async (tweet) => {
    const { data } = await executeQuery(
      "SELECT * FROM `tweetContent` WHERE id=?",
      [tweet.content]
    );

    const tweetContent = data[0];

    await populateLikes(tweetContent);
    await populateRetweets(tweetContent);

    //populate comments
    tweetContent.comment_ids = [];

    //populateSettings
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

  return Promise.all(contentPromises);
}

async function populateLikes(tweet) {
  const likes = await getLikes(tweet.id);
  tweet.liked_by = likes;
}

async function populateRetweets(tweet) {
  const retweets = await getRetweets(tweet.id);
  tweet.retweeted_by = retweets.map((retweet) => retweet.author);
}

async function getTweetById(id) {
  const { data } = await executeQuery("SELECT * FROM `tweets` WHERE id=?", [
    id,
  ]);

  const tweetContentData = await getTweetContent(data);

  return { tweet: data[0], tweetContent: tweetContentData[0] };
}

async function saveTweet(author, content) {
  /*
    - Save Tweet Content
    - insert ID on tweet table
    - return both insertions
  */
  const tweetContent = await executeQuery(
    "INSERT INTO `tweetContent` (author, message, attach, poll, comment) VALUES(?, ?, ?, ?, ?);",
    [author, content.message, content.attach, content.poll, content.comment]
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

async function repeatedRetweet(author, contentId) {
  console.log(author, contentId);
  let { data } = await executeQuery(
    "SELECT EXISTS(SELECT * FROM `tweets` WHERE author=? AND content=? AND retweet=1)",
    [author, contentId]
  );

  const existenceCode = Object.values(data[0])[0];

  return existenceCode === 1;
}

async function getRetweets(tweetId) {
  const { data } = await executeQuery(
    "SELECT * FROM `tweets` WHERE content=? AND retweet=1",
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

async function postRetweet(author, contentId) {
  let { data } = await executeQuery(
    "INSERT INTO `tweets` (author, retweet, content) VALUES(?, 1, ?);",
    [author, contentId]
  );

  const { insertId } = data;

  /* 
  Write a function getRetweet that returns the retweet with the tweet field populated
  */
  return getTweetById(insertId);
}

async function deleteRetweet(author, contentId) {
  let { data } = await executeQuery(
    "DELETE FROM `tweets` WHERE author=? AND content=? AND retweet=1;",
    [author, contentId]
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
