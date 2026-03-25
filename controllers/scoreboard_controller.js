const Scoreboard = require("../models/scoreboard-model");

exports.getLeaderboard = async (req, res) => {
    try {
        const topTen = await Scoreboard.getTopTen();
        const currentUsername = req.session?.username || null;
        const user = req.session?.user || null;
        res.render('scoreboard/scoreboard', { topTen, user });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

exports.deleteScore = async (req, res) => {
    try {
        await Scoreboard.deleteScore(req.params.playerId);
        res.redirect('/scoreboard');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};