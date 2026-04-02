const mongoose = require("mongoose");
const User = require("./user-model");
const dbcommons = require("./dbcommons");
const utilities = require("../utilities/utilities");

const scoreboardSchema = new mongoose.Schema({
    playerId: {type: String, required: true, unique: true, ref: "User"},
    highscore: {type: Number, required: true},
    gamesPlayed: {type: Number, required: true},
    lastPlayed: {type: Date, default: Date.now},
    jumps: {type: Number, required: true, default: 0},
});

const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema);

exports.getTopLimit = async function(limit, ascending, search) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    const sortOrder = ascending ? 1 : -1;
        
    let results = await Scoreboard.find().sort({highscore: sortOrder}).populate("playerId").lean();
    //console.log(JSON.stringify(results));
    
    if (search) results = utilities.fuzzySearch(search.toLowerCase(), results, false, a => a.playerId.username.toLowerCase());
    return results.slice(0, limit);
};

exports.getCount = function() {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return Scoreboard.countDocuments();
};

exports.upsertScore = function(playerId, newScore, jumps) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    
    return Scoreboard.findOneAndUpdate(
        {playerId: playerId},
        {
            $set: {lastPlayed: new Date()},
            $max: {highscore: newScore},
            $inc: {gamesPlayed: 1, jumps: jumps}
        },
        {upsert: true, returnDocument: 'after'}
    );
};

exports.deleteScore = function(playerId) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return Scoreboard.deleteOne({playerId: playerId});
};

exports.getFriendScoresByPlayerIds = function(playerIds, ascending = false, requireUsername = false) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    
    const sortOrder = ascending ? 1 : -1;
    
    if (requireUsername) return Scoreboard.find({playerId: {$in: playerIds}}).populate("playerId").sort({highscore: sortOrder});
    
    return Scoreboard.find({playerId: {$in: playerIds}}).sort({highscore: sortOrder});
};

exports.getHighscore = async (playerId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    
    let data = await Scoreboard.findOne({playerId}).lean();
    return data.highscore;
}