const mongoose = require("mongoose");

const scoreboardSchema = new mongoose.Schema({
    playerId: {type: String, required: true, unique: true},
    username: {type: String, required: true},
    highscore: {type: Number, required: true},
    gamesPlayed: {type: Number, required: true},
    lastPlayed: {type: Date, default: Date.now}
})

const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema);

exports.getTopTen = function() {
    return Scoreboard.find().sort({ highscore: -1 }).limit(10);
};

exports.upsertScore = function(playerId, username, newScore) {
    return Scoreboard.findOneAndUpdate(
        { playerId: playerId },
        {
            $set: { username: username, lastPlayed: new Date() },
            $max: { highscore: newScore },
            $inc: { gamesPlayed: 1 }
        },
        { upsert: true, returnDocument: 'after' }
    );
};

exports.deleteScore = function(playerId) {
    return Scoreboard.deleteOne({ playerId: playerId });
};

exports.getFriendScores = function(playerIds) {
    return Scoreboard.find({playerId: {$in: playerIds}}).sort({highscore: -1});
};