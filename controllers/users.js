const users_ph = [
  {
    id: 1,
    username: "Timóteo",
    description: "This is a description",
    webpage: "https://github.com/",
    joined: new Date(),
    birth: "28/05/1992",
    avatar: "",
    background: "",
    following: [""],
    followers: [""],
  },
  {
    id: 3,
    username: "Alfredo",
    description: "This is a description",
    webpage: "https://github.com/",
    joined: new Date(),
    birth: "28/05/1992",
    avatar: "",
    background: "",
    following: [""],
    followers: [""],
  },
];

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
  //gets an user by the id parameter of the ui
  // return an object containing said user

  let { id } = req.params;

  User.findByPk(id).then((user) => {
    res.json({
      success: true,
      user,
    });
  });
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
  createUser,
  verifyUser,
};
