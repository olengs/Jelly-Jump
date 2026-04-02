const express = require("express");
const router = express.Router();
const jellyControllers = require("../controllers/jelly_controller");
const middleware = require("../middleware/user-middleware");

router.get("/", middleware.requireUser, jellyControllers.showJellies);
module.exports = router;
