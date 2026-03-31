const express = require("express");
const router = express.Router();

const friendControllers = require("../controllers/friends_controllers");
const middleware = require("../middleware/user-middleware");

router.get("/friendslist",middleware.requireUser, friendControllers.friendslist);
router.post('/addfriend',middleware.requireUser,friendControllers.addFriend)
router.post('/deletefriend',middleware.requireUser,friendControllers.deleteFriend)

module.exports = router;
