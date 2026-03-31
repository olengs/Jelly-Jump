const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");


const inventorySchema = new mongoose.Schema({
    playerId: {type: String, required: true},
    currencyBalance: {type: Number, required: true, default: 0}, 
    shields: {type: Number, required: true, default: 0},
    lastItemPurchasedDate: {type: Date, default: null},
    numberOfCoupons: {type: Number, required: true, default: 0}
});

const Inventory = mongoose.model("Inventory", inventorySchema, "inventory");

exports.Inventory = Inventory;

exports.createInventory = async (playerId) => {
    let inventory = await Inventory.create({playerId});
    return inventory;
};

exports.getInventory = async (playerId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    const inventory = await Inventory.find({playerId:playerId});
    if (!inventory) throw new Error (`Failed to read inventory for player: ${playerId}`);
    return inventory;
}

exports.deductBalance = async (playerId, totalPrice) => {
    const result = await Inventory.findOneAndUpdate(
        { 
            // make sure player has enough money to buy the shield 
            playerId: playerId, 
            currencyBalance: { $gte: totalPrice } // Only run if they have enough money (greater than or equal to)
        }, 
        //update
        { $inc: { currencyBalance: (-1 * totalPrice) } },
        { new: true }
    );

    if (!result) {
        throw new Error("Insufficient funds or player not found");
    }
    return result;
}

exports.addShields = async (playerId, numberOfShields) => {
    const result1 = await Inventory.findOneAndUpdate(
        { playerId: playerId },
        { $inc: { shields: numberOfShields} },
        { new: true }
    ) 
    return result1
}

exports.addCoupons = async (playerId, numberofCoupons) => {
    const result = await Inventory.findOneAndUpdate(
        { playerId: playerId },
        { $inc: {numberOfCoupons: numberofCoupons} },
        { new: true}
    )
    return result
}