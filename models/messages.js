const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../db/dbAdapter");

const User = require("./users");
const Conversation = require("./conversations");

const Message = sequelize.define("message", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING(280),
    allowNull: false,
    validate: {
      filledMessage(value) {
        if (value.trim().length == 0)
          throw new Error("Message cannot be empty ");
      },
    },
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  userID: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
  conversationID: {
    type: Sequelize.INTEGER,
    references: {
      model: Conversation,
      key: "id",
    },
  },
});

User.hasMany(Message, {
  onDelete: "CASCADE",
  foreignKey: { name: "userID", allowNull: false },
});

Message.belongsTo(User, {
  as: "author",
  foreignKey: { name: "userID", allowNull: false },
});

Conversation.hasMany(Message, {
  foreignKey: { name: "conversationID", allowNull: false },
});

Message.belongsTo(Conversation, {
  foreignKey: { name: "conversationID", allowNull: false },
});

module.exports = Message;
