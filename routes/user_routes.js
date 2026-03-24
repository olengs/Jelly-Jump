const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user_controllers");
const userMiddleware = require("../middleware/user-middleware");

router.get("/login", userMiddleware.autoLoginIfAuthenticated, userControllers.loginView);
router.get("/signup", userMiddleware.autoLoginIfAuthenticated, userControllers.signupView);
router.post("/login", userControllers.login);
router.post("/signup", userControllers.signup);
router.get("/logout", userMiddleware.requireUser, userControllers.logout);

//temp route
router.get("/home", userMiddleware.requireUser, (req, res) => {
    res.render("home", {});
});

module.exports = router;