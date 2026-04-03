const express = require("express"); 
const profileController = require("../controllers/profile-controller");
const userController = require("../controllers/user_controllers");
const UserMiddleware = require("../middleware/user-middleware");
const router = express.Router();

// read- show profile page 
router.get("/view", UserMiddleware.requireUser, profileController.getOwnProfile);
router.get("/view/:id", UserMiddleware.requireUser, profileController.getProfile);

// update - show edit profile form 
router.get("/edit", UserMiddleware.requireUser, profileController.getEditProfile);

// update - handle edit profile form submission 
router.post("/edit", UserMiddleware.requireUser, profileController.postEditProfile);

// delete - delete account 
router.post("/delete", UserMiddleware.requireUser, userController.deleteUser);

// read - show player history page 
router.get("/history/:id", UserMiddleware.requireUser, profileController.getHistory);

// update - show edit history form 
router.get("/history/edit/:id", UserMiddleware.requireUser, profileController.getEditHistory);

// update - edit history 
router.post("/history/edit/:id", UserMiddleware.requireUser, profileController.postEditHistory);

// delete - delete a single history entry
router.post("/history/delete/:id", UserMiddleware.requireUser, profileController.deleteHistory);

router.get("/viewall", UserMiddleware.requireSysadmin, userController.viewAllUsers);
router.post("/makeAdmin", UserMiddleware.requireSysadmin, userController.makeAdmin);
router.post("/makeUser", UserMiddleware.requireSysadmin, userController.makeUser);

module.exports = router;