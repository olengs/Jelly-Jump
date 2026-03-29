const express = require("express");
const router = express.Router();

const HomeControllers = require("../controllers/home_controller");

router.get("/", HomeControllers.home);
router.get("/about", HomeControllers.about);



module.exports = router;
