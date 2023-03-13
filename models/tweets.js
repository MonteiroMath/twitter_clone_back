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

const TWEET_TYPES = {
  SIMPLE: "simple",
  RETWEET: "retweet",
  COMMENT: "comment",
  ANSWER: "answer",
};

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
        args: [Object.values(TWEET_TYPES)],
        msg: "Type must have a valid value [simple, retweet, comment or answer]",
      },
    },
  },
});

Tweet.belongsTo(Tweet, {
  foreignKey: "referenceId",
  as: "reference",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Tweet.hasMany(Tweet, {
  foreignKey: "referenceId",
  as: "retweets",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Tweet.hasMany(Tweet, {
  foreignKey: "referenceId",
  as: "comments",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Tweet.hasMany(Tweet, {
  foreignKey: "referenceId",
  as: "answers",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

module.exports = { Tweet, TWEET_TYPES };
