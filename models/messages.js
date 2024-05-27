const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../db/dbAdapter");

const { User } = require("./users");

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
  author: {
    type: Sequelize.INTEGER,
    references: {
      model: "users",
      key: "id",
    },
  },
  recipient: {
    type: Sequelize.INTEGER,
    references: {
      model: "users",
      key: "id",
    },
  },
});

User.hasMany(Message, {
  onDelete: "CASCADE",
  foreignKey: { name: "author", allowNull: false },
});

Message.belongsTo(User, {
  as: "author",
  foreignKey: { name: "author", allowNull: false },
});

User.hasMany(Message, {
  foreignKey: { name: "recipient", allowNull: false },
});

Message.belongsTo(User, {
  as: "recipient",
  foreignKey: { name: "recipient", allowNull: false },
});
