const express = require("express");
const router = express.Router();

const userMiddleware = require("../middleware/user-middleware");
const friendControllers = require("../controllers/friends_controllers");

router.get("/friendslist", userMiddleware.requireUser, friendControllers.friendslist);
router.post('/friendslist', userMiddleware.requireUser, friendControllers.addFriend);
router.post('/deletefriend', userMiddleware.requireUser, friendControllers.deleteFriend);
router.post('/acceptfriend', userMiddleware.requireUser, friendControllers.acceptFriend); 
router.post('/rejectfriend', userMiddleware.requireUser, friendControllers.rejectFriend); 

module.exports = router;
