const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");

router.post("/token", controller.login);

module.exports = router;
