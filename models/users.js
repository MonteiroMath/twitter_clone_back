const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../db/dbAdapter");

const User = sequelize.define("user", {
  id: {},
  username: {},
  email: {},
  password: {}, //temporary / placeholder until authentication is implemented
  created_at: {},
});
