const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");
const UserModel = require("./user-model");

const gameRecordsSchema = new mongoose.Schema({
    playerId: {type: mongoose.Types.ObjectId, required: true},
    timestamp: {type: Date, required: true, default: Date.now, expires: '10m'},
    score: {type: Number, required: true},
    character: {type: String, required: true, default: "0"},
    currencyEarned: {type: Number, required: true, default: 0},
    jumps: {type: Number, required: true, default: 0} 
});

const GameRecords = mongoose.model('GameRecords', gameRecordsSchema, "records");
exports.GameRecords = GameRecords;

exports.createRecord = async (playerId, timestamp, score, character, currencyEarned, jumps) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    _ = await UserModel.getUserById(playerId); //discarding, just checking for user, will throw if not found, to be caught in outer scope
    let record = await GameRecords.create({playerId, timestamp, score, character, currencyEarned, jumps});
    if (!record) throw new Error("Failed to create game records");
    return record;
};

exports.getRecordById = async (recordId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    let record = await GameRecords.findById(recordId);
    if (!record) throw new Error("Failed to retrieve record");
    return record;
}

exports.getPlayerHistory = async (playerId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    
    const history = await GameRecords.find({playerId: playerId}).sort({timestamp:-1});
    if (!history) throw new Error(`Failed to find game records of player: ${playerId}`);
    return history; 
};

exports.updateRecord = async (id, updatedData) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return await GameRecords.findByIdAndUpdate(id, updatedData, {new: true}).lean();
};

exports.deleteRecord = async (id) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return await GameRecords.findOneAndDelete({_id: id}).lean();
};

exports.deleteAllRecordsByUser = async (playerId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    await GameRecords.deleteMany({playerId});
};