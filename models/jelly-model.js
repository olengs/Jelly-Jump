const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");

const jellySchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    currentlyEquippedCharacter: {type: Number, required: true, default: 0},
    characterNicknames: [{type:String,required:true}],
    characterRank: [{type:Number,required:true}],
    characterXp: [{type:Number,required:true}]
});

const jellyNames = {
    0: "Jelly0", 1: "Jelly1", 2: "Jelly2", 3: "Jelly3",
    4: "Jelly4", 5: "Jelly5", 6: "Jelly6", 7: "Jelly7",
    8: "Jelly8", 9: "Jelly9", 10: "Jelly10", 11: "Jelly11",
};

exports.getJellyUpgradeCost = (currRank) => (currRank + 1) * 20;

const Jelly = mongoose.model('Jelly', jellySchema, 'jellies');
exports.Jelly = Jelly;

exports.createJellyStore = async (playerId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    let ranks = Array.from({length: jellyNames}).fill(0);
    ranks[0] = 1;

    console.log(Array.from(jellyNames));
    console.log(Array.from({length: jellyNames}).fill(0));

    let store = Jelly.create({playerId, 
        characterNicknames: Array.from(jellyNames),
        characterRank: ranks,
        characterXp: Array.from({length: jellyNames}).fill(0),
    });

    if (!store) throw new Error("Failed to create jelly for player");
    return store;
}

exports.getJelliesByPlayerId = async (playerId) =>{
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    let jellies = await Jelly.findOne({ playerId }).lean();
    if (!jellies) {
        return this.createJellyStore(playerId);
    }

    return jellies;
}   

exports.incrementJellyFragments = async (playerId, data) => {
    frequencies = data.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {});

    let updated = await Jelly.findOneAndUpdate({playerId}, {$inc: frequencies}, {returnDocument: "after"});
    if (!updated) throw new Error("Failed to update jelly earned");
}

exports.upgradeJelly = async (playerId, jellyId) => {
    const currjellies = await Jelly.findOne({playerId}).lean();

    let upgradeCost = this.getJellyUpgradeCost(currjellies.characterRank[jellyId]);
    if (currjellies.characterXp[jellyId] >= upgradeCost) {
        let ret = Jelly.updateOne({playerId}, {
            $inc: {
                characterRank: 1,
                characterXp: -upgradeCost
            }
        });
        console.log(ret);
        return;
    }

    throw new Error("Insufficient Fragments");
}

exports.deleteJellies = async (playerId) => {
    return await Jelly.deleteOne({playerId});
}