// 6 fields: userID, score, level, duration, result, playedAt 

const mongoose = require("mongoose");

const gameRecordsSchema = new mongoose.Schema({
    recordId: {type: String, required: true},
    playerId: { type: String, required: true}, 
    score: {type: Number, required: true}, 
    character: {type: String, default: "0"}, 
    currencyEarned: {type: Number, default: 0}, 
    timestamp: {type: Date, default: Date.now()},
}); 

module.exports = mongoose.model("GameRecords", gameRecordsSchema, "records"); 