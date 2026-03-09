const express = require("express");
const router = express.Router();

const game_controller = require("../controllers/game_controller")

router.get("/", game_controller.gameViewController);

module.exports = router;