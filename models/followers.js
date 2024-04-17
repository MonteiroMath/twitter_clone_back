const { DataTypes } = require("sequelize");

const { sequelize } = require("../db/dbAdapter");

const { User } = require("./users");

const Follower = sequelize.define("follower", {
  FollowerId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
  FollowingId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
});

User.belongsToMany(User, {
  through: Follower,
  as: "follower",
  foreignKey: "FollowerId",
});
User.belongsToMany(User, {
  through: Follower,
  as: "following",
  foreignKey: "FollowingId",
});

module.exports = Follower;
