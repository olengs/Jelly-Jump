const express = require("express");
const router = express.Router();

const GameControllers = require("../controllers/game_controllers")

router.use(express.json());

router.get("/", GameControllers.gameViewController);

router.post("/endgame", GameControllers.EndGameUpdateController);

module.exports = router;