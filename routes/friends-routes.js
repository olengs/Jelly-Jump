const express = require("express");
const router = express.Router();

const friendControllers = require("../controllers/friends_controllers");

router.get("/friendslist",friendControllers.friendslist);
router.post('/addfriend',friendControllers.addFriend)
router.post('/deletefriend',friendControllers.deleteFriend)

module.exports = router;
