const User = require("../models/users");

const getUsers = (req, res) => {
  //return the list of users

  User.findAll().then((users) => res.json({ success: true, users }));
};

const createUser = (req, res, next) => {
  const { username, email, password, birthDate, webpage } = req.body;

  if (!username || !email || !password || !birthDate)
    throw new Error("Invalid request - User data must be informed");

  User.create({ username, email, password, birthDate, webpage })
    .then((user) => res.json({ success: true, user }))
    .catch(next);
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
};
