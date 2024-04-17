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

/* GET users listing. */
router.get("/", getUserByUsername);

router.post("/register", createUser);

router.post("/login", login);

// GET an user by ID
router.get("/:id", getUser);

// GET an user by name
router.get("/username/:id", getUser);

//Followers routes

router.post("/follow/:followedId", checkAuth, followUser);
router.delete("/follow/:followedId", checkAuth, unfollowUser);

module.exports = router;
