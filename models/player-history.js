// 6 fields: userID, score, level, duration, result, playedAt 

const mongoose = require("mongoose");

const playerHistorySchema = new mongoose.Schema({
    userID: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, 
    recordId: { type: String, required: true}, 
    score: {type: Number, required: true}, 
    character: {type: String, default: ""}, 
    currencyEarned: {type: Number, default: 0}, 
    timestamp: {type: Date, default: Date.now},
}); 

module.exports = mongoose.model("PlayerHistory", playerHistorySchema); 