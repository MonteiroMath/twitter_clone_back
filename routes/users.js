var express = require("express");
var router = express.Router();
const {
  getUser,
  getUsers,
  findUser,
  createUser,
  login,
} = require("../controllers/users");

/* GET users listing. */
router.get("/", getUsers);

router.post("/", createUser);

router.post("/login", login);

// GET an user by ID
router.get("/:id", getUser);

module.exports = router;
