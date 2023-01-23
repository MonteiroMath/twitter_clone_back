const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../db/dbAdapter");

/*

Todo:
 - set association with itself
 - set validations
  - Types
    - simple for a simple tweet
    - retweet for a tweet without a mesage
    - comment for a retweet with a message
    - answer for an answer  to another tweet
 
*/

const Tweet = sequelize.define("tweet", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING(280),
  },
  attachment: {
    type: DataTypes.STRING(100),
  },
  poll: { type: DataTypes.BOOLEAN, defaultValue: false },
  type: {
    type: DataTypes.STRING,
    defaultValue: "simple",
    validate: {
      isIn: [["simple", "retweet", "comment", "answer"]],
      msg: "Type must have a valid value [simples, retweet, comment or answer]",
    },
  },
});
