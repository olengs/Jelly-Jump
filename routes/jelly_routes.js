const express = require("express");
const router = express.Router();
const jellyControllers = require("../controllers/jelly_controller");
const middleware = require("../middleware/user-middleware");

router.get("/", middleware.requireUser, jellyControllers.showJellies);
router.post("/upgrade", middleware.requireUser, jellyControllers.upgrade);
module.exports = router;
