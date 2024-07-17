const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/dbAdapter");

const User = require("./users");
const Conversation = require("./conversations");

const ConversationParticipants = sequelize.define("conversationParticipant", {
  conversationID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Conversation,
      key: "id",
    },
  },
  userID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

User.belongsToMany(Conversation, {
  through: ConversationParticipants,
  foreignKey: "userID",
});

Conversation.belongsToMany(User, {
  through: ConversationParticipants,
  as: "participants",
  foreignKey: "conversationID",
});

module.exports = ConversationParticipants;
