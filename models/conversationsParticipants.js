const { DataTypes } = require("sequelize");
const { sequelize } = frequire("../db/dbAdapter");

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
});

Conversation.belongsToMany(User, { through: ConversationParticipants });

module.exports = ConversationParticipants;
