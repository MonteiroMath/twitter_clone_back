var express = require("express");
var router = express.Router();
const {
  getUser,
  getUserByUsername,
  createUser,
  login,
  followUser,
  unfollowUser,
} = require("../controllers/users");

const checkAuth = require("../middleware/checkAuth");

/* GET user by userName */
router.get("/", checkAuth, getUserByUsername);

// GET an user by ID
router.get("/:id", checkAuth, getUser);

//Register an User
router.post("/register", createUser);

//Sign in an User
router.post("/login", login);

//Followers routes
router.post("/follow/:followedId", checkAuth, followUser);
router.delete("/follow/:followedId", checkAuth, unfollowUser);

module.exports = router;
