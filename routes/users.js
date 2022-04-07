var express = require("express");
var router = express.Router();
const { getUser, getUsers } = require("../controllers/users");

/* GET users listing. */
router.get("/", getUsers);

// GET an user by ID
router.get("/:id", getUser);

module.exports = router;
