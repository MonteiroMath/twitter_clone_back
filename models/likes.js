const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../db/dbAdapter");

const User = require("./users");
const Tweet = require("./tweets");

const Likes = sequelize.define("like", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  tweetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Tweet,
      key: "id",
    },
  },
});

User.belongsToMany(Tweet, { as: "likedTweets", through: Likes });
Tweet.belongsToMany(User, { as: "likers", through: Likes });

module.exports = Likes;
