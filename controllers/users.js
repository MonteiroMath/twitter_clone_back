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

  if (!user) {
    return res.status(404).json({ success: false, msg: "User not found" });
  }

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
    return res
      .status(400)
      .json({ sucess: false, msg: "The user id must be informed" });
  }

  const user = findUserById(userId);

  if (!user) {
    return res
      .status(404)
      .json({ sucess: false, msg: `The user ${userId} was not found` });
  }

  req.userId = userId;

  next();
}

function findUserById(id) {
  return users_ph.find((user) => user.id == id);
}

module.exports = {
  getUsers,
  getUser,
  verifyUser,
};
