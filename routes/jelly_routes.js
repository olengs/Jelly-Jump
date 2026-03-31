const express = require("express");
const router = express.Router();
const jellyControllers = require("../controllers/jelly_controller");


router.get("/jelly", jellyControllers.showJellies);
module.exports = router;
