const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
require("dotenv").config();

const { sequelize } = require("./db/dbAdapter");
const User = require("./models/users");

const usersRouter = require("./routes/users");
const tweetsRouter = require("./routes/tweets");

const app = express();
const store = new SequelizeStore({ db: sequelize });
store.sync();

app.use(
  session({
    secret: "this is very very secret",
    store,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use("/tweets", tweetsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ success: false, msg: err.message, err: err.status });
});

module.exports = app;
