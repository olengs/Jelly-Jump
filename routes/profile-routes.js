const express = require("express"); 
const profileController = require("../controllers/profile-controller");
const UserMiddleware = require("../middleware/user-middleware");
const router = express.Router();

// read- show profile page 
router.get("/profile", UserMiddleware.requireUser, profileController.getProfile);

// update - show edit profile form 
router.get("/profile/edit", UserMiddleware.requireUser, profileController.getEditProfile);

// update - handle edit profile form submission 
router.post("/profile/edit", UserMiddleware.requireUser, profileController.postEditProfile);

// delete - delete account 
router.post("/profile/delete", UserMiddleware.requireUser, profileController.deleteProfile);

// read - show player history page 
router.get("/history", UserMiddleware.requireUser, profileController.getHistory); 

// delete - delete a single history entry
router.post("/history/delete/:id", UserMiddleware.requireUser, profileController.deleteHistory); 

module.exports = router; 