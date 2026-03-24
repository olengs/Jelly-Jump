const express = require("express");
const router = express.Router();

const FriendsControllers = require("../controllers/friends_controllers");

router.get("/friendslist", FriendsControllers.friendslist);
router.post('/addfriend',FriendsControllers.addFriend)
router.post('/deletefriend',FriendsControllers.deleteFriend)

module.exports = router;
