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

const getUsers = (req, res) => {
  //return the list of users

  res.json(users_ph);
};

const getUser = (req, res) => {
  //gets an user by the id parameter of the ui
  // return an object containing said user

  let { id } = req.params;

  let user = findUserById(id);

  res.json({
    success: true,
    user,
  });
};

function verifyUser(req, res, next) {
  //middleware that verifies if an userId was sent in the body of the request and if the informed corresponds to an actual user
  //responds with an error if negative. Adds the id to the userId property of the request if positive.

  const { userId } = req.body;
  if (!userId) {
    throw new Error("The user id must be informed");
  }

  findUserById(userId);

  req.userId = parseInt(userId);

  next();
}

function findUserById(id) {
  const user = users_ph.find((user) => user.id === parseInt(id));

  if (!user) {
    throw new Error(`User ${id} not found`);
  }

  return user;
}

module.exports = {
  getUsers,
  getUser,
  verifyUser,
};
