const express = require('express');
const router = express.Router();
const ScoreboardController = require('../controllers/scoreboard_controller');

router.get('/', ScoreboardController.getLeaderboard);

module.exports = router;