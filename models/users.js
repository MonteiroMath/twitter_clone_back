const { Sequelize, DataTypes } = require("sequelize");
const validator = require("validator");
const { sequelize } = require("../db/dbAdapter");

const Tweet = require("./tweets");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(10),
    allowNull: false,
  }, //temporary / placeholder until authentication is implemented
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
  },
  webpage: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
    validate: {
      verifyUrl(value) {
        if (value.length !== 0 && !validator.isURL(value))
          throw new Error("Invalid Url informed for webpage.");
      },
    },
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter: {
        args: "1900-01-01",
        msg: "Birth date must be posterior to 1900-01-01",
      },
    },
  },
  avatar: {
    type: DataTypes.STRING(100),
  },
  background: {
    type: DataTypes.STRING(100),
  },
});

User.hasMany(Tweet, {
  onDelete: "CASCADE",
  foreignKey: "author",
});
Tweet.belongsTo(User);

module.exports = User;
