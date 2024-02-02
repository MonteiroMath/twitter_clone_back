const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

const JWT_SECRET = process.env.JWT_SECRET;

const getUsers = (req, res) => {
  //return the list of users

  User.findAll().then((users) => res.json({ success: true, users }));
};

const getUser = (req, res) => {
  //gets an user by the id parameter
  // return an object to the client containing said user

  let { id } = req.params;

  User.findByPk(id).then((user) => {
    res.json({
      success: true,
      user,
    });
  });
};

const createUser = (req, res, next) => {
  const { username, email, password, birthDate, webpage } = req.body;

  if (!username || !email || !password || !birthDate)
    throw new Error("Invalid request - User data must be informed");

  User.findOne({
    where: {
      email,
    },
  })
    .then((user) => {
      if (user) {
        const error = new Error("User already registered");
        error.status = 409;
        next(error);
      }

      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        password: hashedPassword,
        birthDate,
        webpage,
      });
    })
    .then((user) => res.json({ success: true, user }))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  let user;

  if (!email || !password) {
    const error = new Error("Invalid request - User data must be informed");
    error.status = 400;
    next(error);
  }

  User.findOne({ where: { email } })
    .then((registeredUser) => {
      if (!registeredUser) {
        const error = new Error("User not found");
        error.status = 404;
        next(error);
      }

      user = registeredUser;
      return bcrypt.compare(password, user.password);
    })
    .then((correctPassword) => {
      if (!correctPassword) {
        const error = new Error("Wrong Password");
        error.status = 401;
        next(error);
      }

      const jwtToken = jwt.sign(
        {
          userId: user.id,
        },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({ success: true, jwtToken, userId: user.id });
    });
};

//middlewares //todo move to a middlewares folder

const findUser = (req, res, next) => {
  //find an user by the userId parameter
  //set said user on the req and pass execution to the next middleware

  const { id } = req.params;

  User.findByPk(id)
    .then((user) => {
      if (!user) throw new Error(`User ${id} not found`);

      req.user = user;
      next();
    })
    .catch(next);
};

const parseUserFromBody = (req, res, next) => {
  const { userId } = req.body;

  if (!userId) throw new Error(`An user id must be informed`);

  User.findByPk(userId)
    .then((user) => {
      if (!user) throw new Error(`User ${userId} not found`);

      req.user = user;
      next();
    })
    .catch(next);
};

const parseUserFromQuery = (req, res, next) => {
  const { userId } = req.query;

  if (!userId) throw new Error("An user id must be informed");

  User.findByPk(userId)
    .then((user) => {
      if (!user) throw new Error(`User ${userId} not found`);
      req.user = user;
      next();
    })
    .catch(next);
};

function verifyUser(req, res, next) {
  //middleware that verifies if an userId was sent in the body of the request and if the informed corresponds to an actual user
  //responds with an error if negative. Adds the id to the userId property of the request if positive.

  const { userId } = req.body;
  if (!userId) {
    throw new Error("The user id must be informed");
  }

  User.findByPk(userId).then((user) => {
    if (!user) throw new Error(`User ${id} not found`);

    req.userId = parseInt(userId);
    next();
  });
}

module.exports = {
  getUsers,
  getUser,
  findUser,
  parseUserFromBody,
  parseUserFromQuery,
  createUser,
  verifyUser,
  login,
};
