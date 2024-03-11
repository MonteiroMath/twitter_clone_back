var express = require("express");
var router = express.Router();
const {
  getUser,
  getUsers,
  findUser,
  createUser,
  login,
  logout,
} = require("../controllers/users");

/* GET users listing. */
router.get("/", getUsers);

router.post("/register", createUser);

router.post("/login", login);

router.post("/logout", logout);

// GET an user by ID
router.get("/:id", getUser);

module.exports = router;
