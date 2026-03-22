const express = require("express"); 
const router = express.router();
const profileController = require("../controllers/profile-controller");

// read- show profile page 
router.get("/profile", profileController.getProfile);

// update - show edit profile form 
router.get("/profile/edit", profileController.getEditProfile);

// update - handle edit profile form submission 
router.post("/profile/edit", profileController.postEditProfile);

// delete - delete account 
router.post("/profile/delete", profileController.deleteProfile);

// read - show player history page 
route.get("/history", profileController.getHistory); 

// delete - delete a single history entry
router.post("/history/delete/:id", profileController.deleteHistory); 

module.exports = router; 