const { DataTypes } = require("sequelize");

const { sequelize } = require("../db/dbAdapter");

const User = require("./users");

const Follower = sequelize.define("Follow", {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  followedId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

User.belongsToMany(User, {
  as: "follower",
  through: Follower,
  foreignKey: "followerId",
});

User.belongsToMany(User, {
  as: "followed",
  through: Follower,
  foreignKey: "followedId",
});

module.exports = Follower;
