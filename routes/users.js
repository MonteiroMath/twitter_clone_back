var express = require("express");
var router = express.Router();
const {
  getUser,
  getUsers,
  findUser,
  createUser,
} = require("../controllers/users");

/* GET users listing. */
router.get("/", getUsers);

router.post("/", createUser);

// GET an user by ID
router.get("/:id", getUser);

module.exports = router;
