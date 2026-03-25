const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");
const UserModel = require("./user-model");
const errors = require("./errors");
const crypto = require("crypto");

const gameRecordsSchema = new mongoose.Schema({
    playerId: {type: String, required: true},
    timestamp: {type: Date, required: true, default: Date.now()},
    score: {type: Number, required: true},
    character: {type: String, required: true, default: "0"},
    currencyEarned: {type: Number, required: true, default: 0},
});

const GameRecords = mongoose.model('GameRecords', gameRecordsSchema, "records");
exports.GameRecords = GameRecords;

exports.createRecord = async (playerUID, timestamp, score, character, currencyEarned) => {
    _ = await UserModel.getUserByUUID(playerUID); //discarding, just checking for user, will throw if not found, to be caught in outer scope
    let recordId = crypto.randomUUID();
    let record = new GameRecords({recordId, playerUID, timestamp, score, character, currencyEarned});
    return await record.save();
};

exports.getPlayerHistory = async (playerId) => {
    const history = await GameRecords.find({playerId: playerId}).sort({timestamp:-1});
    return history; 
};

exports.updateRecord = async (id, updatedData) => {
    const updated = await GameRecords.findByIdAndUpdate(id, updatedData, {new: true});
    return updated; 
};

exports.deleteRecord = async (id) => {
    await GameRecords.findByIdAndDelete(id);
};