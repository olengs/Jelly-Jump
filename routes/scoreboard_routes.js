const express = require('express');
const router = express.Router();
const ScoreboardController = require('../controllers/scoreboard_controller');
const authMiddleware = require('../middleware/user-middleware');


router.get('/', authMiddleware.requireUser, ScoreboardController.getLeaderboard);
router.post('/delete/:playerId', authMiddleware.requireAdmin, ScoreboardController.deleteScore);

module.exports = router;