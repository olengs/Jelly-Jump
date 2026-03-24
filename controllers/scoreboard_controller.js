const Scoreboard = require("../models/scoreboard-model");

exports.getLeaderboard = async (req, res) => {
    try {
        const topTen = await Scoreboard.getTopTen();
        const currentUsername = req.session?.username || null;
        res.render('scoreboard/scoreboard', { topTen });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};