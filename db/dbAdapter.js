const mysql = require("mysql2/promise");

//get tweet and post tweet

async function executeQuery(query, params) {
  try {
    const con = await mysql.createConnection({
      host: "localhost",
      user: process.env.DBUSER,
      password: process.env.PASSWORD,
      database: "twitter",
    });

    const [rows, fields] = await con.execute(query, params);

    return { data: rows };
  } catch (err) {
    console.log(err);
  }
}

async function getTweets(id) {
  const { data } = await executeQuery(
    "SELECT * FROM `twittertest` WHERE author=?",
    [id]
  );

  return data;
}

module.exports = {
  getTweets,
};
