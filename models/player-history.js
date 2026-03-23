// 6 fields: userID, score, level, duration, result, playedAt 

const mongoose = require("mongoose");

const playerHistorySchema = new mongoose.Schema({
    userID: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, 
    score: { type: Number, required: true}, 
    level: {type: Number, required: true}, 
    duration: {type: Number, required: true}, 
    result: {type: String, required: true}, 
    playedAt: {type: Date, default: Date.now},
}); 

module.exports = mongoose.model("PlayerHistory", playerHistorySchema); 