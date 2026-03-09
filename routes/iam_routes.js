const express = require("express");
const router = express.Router();
const IAMControllers = require("../controllers/iam_controllers");

router.post("/login", IAMControllers.authLogin);
router.post("/signup", IAMControllers.authSignup);

module.exports = router;