const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");

const jellySchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    unlockedCharacters:[{
        characterName:{type:String,required:true},
        characterRank:{type:Number,required:true},
        characterXp:{type:Number,required:true}

    }]
    })

const Jelly = mongoose.model('Jelly',jellySchema,'jellies')
exports.Jelly = Jelly 

exports.getjellyplayerId = async(playerId) =>{
    if (!dbcommons.isDBConnected()) {
        throw dbcommons.databaseError;
    
    }

    return await Jelly.findOne({ playerId });
}