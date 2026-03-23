const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");
const UserModel = require("./user-model");
const errors = require("./errors");
const crypto = require("crypto");

const gameRecordsSchema = new mongoose.Schema({
    playerUID: {type: String, required: true, unique: true},
    timestamp: {type: String, required: true},
    score: {type: Number, required: true},
    character: {type: String, required: true},
    currencyEarned: {type: Number, required: true},
});

const GameRecords = mongoose.model('GameRecords', gameRecordsSchema, "records");
exports.GameRecords = GameRecords;

exports.createRecord = async (playerUID, timestamp, score, character, currencyEarned) => {
    _ = await UserModel.getUserByUUID(playerUID); //discarding, just checking for user, will throw if not found, to be caught in outer scope
    let recordId = crypto.randomUUID();
    let record = new GameRecords({recordId, playerUID, timestamp, score, character, currencyEarned});
    return await record.save();
}