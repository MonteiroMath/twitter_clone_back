const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../db/dbAdapter");

const User = require("./users");

const Follows = sequelize.define("follow", {
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

User.belongsToMany(User, { through: Follows });

module.exports = Follows;
