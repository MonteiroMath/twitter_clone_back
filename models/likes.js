const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../db/dbAdapter");

const User = require("./users");
const Tweet = require("./Tweet");

const Likes = sequelize.define("like", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  twitterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Tweet,
      key: "id",
    },
  },
});

User.belongsToMany(Tweet, { through: Likes });
Tweet.belongsToMany(User, { through: Likes });
