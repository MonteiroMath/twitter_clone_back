const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  "twitterSqlize",
  process.env.DBUSER,
  process.env.PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
  }
);

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

  if (data.length === 0) {
    throw new Error(`Found no tweets for user ${id}`);
  }

  //Busca TweetContent dos tweets
  tweetContent = await getTweetContent(data);

  return { tweets: data, tweetContent };
}

async function getTweetsByParentId(parentId) {
  const { data } = await executeQuery(
    "SELECT * FROM `tweets` WHERE parent=? ORDER BY id DESC LIMIT 10",
    [parentId]
  );

  if (data.length === 0) {
    throw new Error(`No answers found for tweet ${parentId}`);
  }

  //Busca TweetContent dos tweets
  tweetContent = await getTweetContent(data);

  return { tweets: data, tweetContent };
}

async function getTweetContent(tweets) {
  //const uniqueIdList = Array.from(
  //  new Set(tweets.map((tweet) => tweet.content))
  //);

  const uniqueContent = new Set();

  let contentPromises = tweets.map(async ({ id, content }) => {
    if (!uniqueContent.has(content)) {
      uniqueContent.add(content);

      const { data } = await executeQuery(
        "SELECT * FROM `tweetContent` WHERE id=?",
        [content]
      );

      if (data.length === 0) {
        throw Error(`Content not found for tweet ${id}`);
      }

      const tweetContent = data[0];

      await populateLikes(tweetContent);
      await populateRetweets(tweetContent);
      await populateComments(tweetContent, id);

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
    }
  });

  return Promise.all(contentPromises).then((results) => {
    return results.filter((result) => result !== undefined);
  });
}

async function populateLikes(tweet) {
  const likes = await getLikes(tweet.id);
  tweet.liked_by = likes;
}

async function populateRetweets(tweet) {
  const retweets = await getRetweets(tweet.id);
  tweet.retweeted_by = retweets.map((retweet) => retweet.author);
}

async function populateComments(tweet, tweetId) {
  const comments = await getComments(tweetId);
  tweet.comment_ids = comments;
}

async function getTweetById(id) {
  const { data } = await executeQuery("SELECT * FROM `tweets` WHERE id=?", [
    id,
  ]);

  if (data.length === 0) {
    throw Error(`Tweet ${id} not found`);
  }

  const tweetContentData = await getTweetContent(data);

  return { tweet: data[0], tweetContent: tweetContentData[0] };
}

async function saveTweet(author, content, parentId = null) {
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
    "INSERT INTO `tweets` (author, content, parent) VALUES(?, ?, ?)",
    [author, insertId, parentId]
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

async function getComments(id) {
  let { data } = await executeQuery("SELECT * FROM tweets WHERE parent=?", [
    id,
  ]);

  return data;
}

async function repeatedRetweet(author, contentId) {
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

async function postRetweet(author, tweetId, contentId) {
  let { data } = await executeQuery(
    "INSERT INTO `tweets` (author, retweet, content, original) VALUES(?, 1, ?, ?);",
    [author, contentId, tweetId]
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
  sequelize,
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
};
