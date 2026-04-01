const Scoreboard = require("../models/scoreboard-model");
const User = require('../models/user-model');

exports.getLeaderboard = async (req, res) => {
    try {
        const total = await Scoreboard.getCount();
        const limit = req.query.limit || total;
        const ascending = req.query.sort === 'asc' ? true : false;
        const search = req.query.search || '';

        const topLimit = await Scoreboard.getTopLimit(limit, ascending, search);
        const user = req.session && req.session.user ? req.session.user : null;
        let friendsScores = [];

        // attach username to each scoreboard entry
        for (let i = 0; i < topLimit.length; i++) {
            const playerUser = await User.getUserById(topLimit[i].playerId);
            topLimit[i].username = playerUser.username;
        }; 

        if (user) {
            // .lean() to get a plain JS object instead of a Mongoose document
            const userDoc = await User.getUserById(user._id);
            const friendIds = [];

            if (userDoc.friends) {
                for (let i = 0; i < userDoc.friends.length; i++) {
                    friendIds.push(userDoc.friends[i].toString());
                };
            };

            // include the user's own id too
            friendIds.push(user._id.toString());
            friendsScores = await Scoreboard.getFriendScoresByPlayerIds(friendIds, ascending);

            // attach username to friend scores too
            for (let i = 0; i < friendsScores.length; i++) {
                const friendUser = await User.getUserById(friendsScores[i].playerId);
                friendsScores[i].username = friendUser.username;
            };
        };

        res.render('scoreboard/scoreboard', {topLimit, total, limit, sort: req.query.sort || 'desc', search, user, friendsScores});
    } catch (error) {
        console.log(error);
        res.status(500).render('error', {error: error.message});
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