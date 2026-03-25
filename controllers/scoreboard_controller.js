const Scoreboard = require("../models/scoreboard-model");
const Friend = require('../models/friend-model');

exports.getLeaderboard = async (req, res) => {
    try {
        const topTen = await Scoreboard.getTopTen();
        const user = req.session?.user || null;
        let friendsScores = [];
        
        if (user) {
            const friendDoc = await Friend.findOne({playerId: user._id.toString()});

            console.log("user id:", user._id.toString());
            console.log("friendDoc:", friendDoc);

            console.log("friendsId length:", friendDoc.friendsId.length);
            console.log("friendsId value:", friendDoc.friendsId);

            if (friendDoc && friendDoc.friendsId && friendDoc.friendsId.length > 0) {

                // spreads friend array + add user's own id at the end
                const ids = [...friendDoc.friendsId, user._id.toString()];
                console.log("ids to query:", ids);
                
                friendsScores = await Scoreboard.getFriendScores(ids);
                console.log("friendsScores:", friendsScores);
                
            // oop no friend just show own score
            } else {
                friendsScores = await Scoreboard.getFriendScores([user._id.toString()]);
            };
        };

        res.render('scoreboard/scoreboard', {topTen, user, friendsScores});
    } catch (error) {
        console.log(error)
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