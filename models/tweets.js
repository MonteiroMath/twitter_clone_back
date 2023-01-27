const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../db/dbAdapter");

/*

Todo:
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
    allowNull: true,
    validate: {
      emptyMessageForRetweet(value) {
        console.log(value);
        if (this.type === "retweet" && value)
          throw new Error("Message must be empty for retweets");
      },
      filledMessage(value) {
        if (this.type !== "retweet" && (value == null || value.length == 0))
          throw new Error("Message cannot be empty unless it is a retweet");
      },
    },
  },
  attachment: {
    type: DataTypes.STRING(100),
    validate: {
      noAttachmentForRetweets(value) {
        if (this.type === "retweet" && value !== null)
          throw new Error("Retweets cannot have attachments");
      },
    },
  },
  poll: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    validate: {
      noPollsForRetweets(value) {
        if (this.type === "retweet" && value !== false)
          throw new Error("Retweets cannot have polls");
      },
    },
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "simple",
    validate: {
      isIn: {
        args: [["simple", "retweet", "comment", "answer"]],
        msg: "Type must have a valid value [simples, retweet, comment or answer]",
      },
    },
  },
});

//Represents the association a tweet has with another one when it is not of type simple
Tweet.hasOne(Tweet, {
  as: "reference",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

module.exports = Tweet;
