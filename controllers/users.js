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
  res.json(users_ph);
};

const getUser = (req, res) => {
  let { id } = req.params;

  let user = users_ph.find((user) => user.id == id);

  if (!user) {
    return res.status(404).json({ success: false, msg: "User not found" });
  }

  res.json({
    success: true,
    user,
  });
};

module.exports = {
  getUsers,
  getUser,
};
