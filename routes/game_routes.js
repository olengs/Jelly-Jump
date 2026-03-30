const express = require("express");
const router = express.Router();
const userMiddleware = require("../middleware/user-middleware");
const GameControllers = require("../controllers/game_controllers")

router.use(express.json());

router.get("/", userMiddleware.requireUser, GameControllers.gameViewController);

router.post("/endgame", GameControllers.EndGameUpdateController);

router.get("/gacha", userMiddleware.requireUser, GameControllers.gachaViewController);

router.post("/gacha", GameControllers.gachaPullRequest);

module.exports = router;