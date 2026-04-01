const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");
const utilities = require("../utilities/utilities");

const scoreboardSchema = new mongoose.Schema({
    playerId: {type: String, required: true, unique: true},
    username: {type: String, required: true},
    highscore: {type: Number, required: true},
    gamesPlayed: {type: Number, required: true},
    lastPlayed: {type: Date, default: Date.now}
})

const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema);

exports.getTopLimit = async function(limit, ascending, search) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    const sortOrder = ascending ? 1 : -1;
        
    let results = await Scoreboard.find().sort({highscore: sortOrder});

    if (search) {
        let filtered = [];
        
        for (let i = 0; i < results.length; i++) {
            const username = results[i].username.toLowerCase();
            const dist = utilities.levenshteinDist(search.toLowerCase(), username.substring(0, search.length));
            if (username.includes(search.toLowerCase()) || dist <= 3) {
                filtered.push(results[i]);
            };
        };
        results = filtered;
    };

    let limited = [];
    for (let i = 0; i < limit && i < results.length; i++) {
        limited.push(results[i]);
    }
    return limited;
};

exports.getCount = function() {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return Scoreboard.countDocuments();
};

exports.upsertScore = function(playerId, username, newScore) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return Scoreboard.findOneAndUpdate(
        {playerId: playerId},
        {
            $set: {username: username, lastPlayed: new Date()},
            $max: {highscore: newScore},
            $inc: {gamesPlayed: 1}
        },
        {upsert: true, returnDocument: 'after'}
    );
};

exports.deleteScore = function(playerId) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return Scoreboard.deleteOne({playerId: playerId});
};

exports.getFriendScoresByUsername = function(usernames, ascending = false) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return Scoreboard.find({playerId: {$in: playerIds}}).sort({highscore: -1});
};

exports.getHighscore = async (playerId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    
    let data = await Scoreboard.findOne({playerId}).lean();
    return data.highscore;
}