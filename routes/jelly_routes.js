const express = require("express");
const router = express.Router();
const jellyControllers = require("../controllers/jelly_controller");
const middleware = require("../middleware/user-middleware");

router.get("/", middleware.requireUser, jellyControllers.showJellies);
router.post("/upgrade", middleware.requireUser, jellyControllers.upgrade);
router.post("/edit", middleware.requireUser, jellyControllers.edit);
router.post("/updateChar", middleware.requireUser, jellyControllers.updateCharacter);
module.exports = router;
