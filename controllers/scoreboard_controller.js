const Scoreboard = require("../models/scoreboard-model");
const {User} = require('../models/user-model');

exports.getLeaderboard = async (req, res) => {
    try {
        const topTen = await Scoreboard.getTopTen();
        // use ? to make sure no crash
        const user = req.session?.user || null;
        let friendsScores = [];

        if (user) {
            // .lean() to get a plain JS object instead of a Mongoose document
            const userDoc = await User.findById(user._id).lean();
            const friendNames = [];
            if (userDoc && userDoc.friends) {
                for (let i = 0; i < userDoc.friends.length; i++) {
                    friendNames.push(userDoc.friends[i].friendName);
                }
            }

            // include the user's own username + all friend usernames
            const usernames = [...friendNames, user.username];
            friendsScores = await Scoreboard.getFriendScoresByUsername(usernames);
        }

        res.render('scoreboard/scoreboard', {topTen, user, friendsScores});
    } catch (error) {
        console.log(error);
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