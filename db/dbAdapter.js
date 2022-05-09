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

  return { data: result };
}

async function getTweets(id) {
  const { data } = await executeQuery(
    "SELECT * FROM `twittertest` WHERE author=?",
    [id]
  );

  return data;
}

async function getTweetById(id) {
  const { data } = await executeQuery(
    "SELECT * FROM `twittertest` WHERE id=?",
    [id]
  );

  return data[0];
}

async function saveTweet(author, content) {
  let { data } = await executeQuery(
    "INSERT INTO `twittertest` (author, message, attach, poll) VALUES(?, ?, ?, ?);",
    [author, content.message, content.attach, content.poll]
  );

  const { insertId } = data;

  return getTweetById(insertId);
}

module.exports = {
  getTweets,
  getTweetById,
  saveTweet,
};
