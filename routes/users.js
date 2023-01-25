var express = require("express");
var router = express.Router();
const {
  getUser,
  getUsers,
  findUser,
  createUser,
} = require("../controllers/users");

const { getTweetsByUser } = require("../controllers/tweets");

/* GET users listing. */
router.get("/", getUsers);

router.post("/", createUser);

// GET an user by ID
router.get("/:id", getUser);

// GET tweets for a specific user
router.get("/:id/tweets", findUser, getTweetsByUser);

module.exports = router;
