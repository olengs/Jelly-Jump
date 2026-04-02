const express = require("express");
const router = express.Router();

const userMiddleware = require("../middleware/user-middleware");
const friendControllers = require("../controllers/friends_controllers");

router.get("/friendslist", userMiddleware.requireUser, friendControllers.whatsProfile);
router.post('/friendslist', userMiddleware.requireUser, friendControllers.addFriend);
router.post('/deletefriend', userMiddleware.requireUser, friendControllers.deleteFriend);

module.exports = router;
