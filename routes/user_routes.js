const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user_controllers");

router.get("/login", userControllers.loginView);
router.get("/signup", userControllers.signupView);
router.post("/login", userControllers.login);
router.post("/signup", userControllers.signup);

module.exports = router;