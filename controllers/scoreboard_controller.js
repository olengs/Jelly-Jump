const Scoreboard = require("../models/scoreboard-model");
const User = require('../models/user-model');

exports.getLeaderboard = async (req, res) => {
    const total = await Scoreboard.getCount();
    const limit = req.query.limit || 10;
    const ascending = req.query.sort === 'asc' ? true : false;
    const search = req.query.search || '';

    const topLimit = await Scoreboard.getTopLimit(limit, ascending, search);
    const user = req.session && req.session.user ? req.session.user : null;
    let friendsScores = [];

    if (user) {
        // .lean() to get a plain JS object instead of a Mongoose document
        const userDoc = await User.getUserById(user._id);
        const friendNames = userDoc.friends?.map(f => f.username) || [];

        // include the user's own username + all friend usernames
        friendNames.push(user.username); 
        const usernames = friendNames;

        friendsScores = await Scoreboard.getFriendScoresByUsername(usernames);
    }

    res.render('scoreboard/scoreboard', {topLimit, total, limit, sort: req.query.sort || 'desc', search, user, friendsScores});
};

exports.deleteScore = async (req, res) => {
    await Scoreboard.deleteScore(req.params.playerId);
    res.redirect('/scoreboard');
};