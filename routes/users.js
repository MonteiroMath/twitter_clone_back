var express = require("express");
var router = express.Router();
const {
  getUser,
  getUserByUsername,
  createUser,
  login,
} = require("../controllers/users");

/* GET users listing. */
router.get("/", getUserByUsername);

router.post("/register", createUser);

router.post("/login", login);

// GET an user by ID
router.get("/:id", getUser);

// GET an user by name
router.get("/username/:id", getUser);

module.exports = router;
