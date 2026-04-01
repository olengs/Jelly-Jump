const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");
const errors = require("./inventory-errors");

const inventorySchema = new mongoose.Schema({
    playerId: {type: String, required: true},
    currencyBalance: {type: Number, required: true, default: 0}, 
    shields: {type: Number, required: true, default: 0},
    lastItemPurchasedDate: {type: Date, default: null},
    numberOfCoupons: {type: Number, required: true, default: 0}
});

const prices = {
    coupons: 1,
    shields: 1,
};

const Inventory = mongoose.model("Inventory", inventorySchema, "inventory");
exports.Inventory = Inventory;

exports.createInventory = async (playerId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    let inventory = await Inventory.create({playerId});
    if (!inventory) throw new Error(`Unable to create inventory for user: ${playerId}`);
    return inventory;
};

exports.getInventory = async (playerId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    const inventory = await Inventory.findOne({playerId: playerId}).lean();
    if (!inventory) throw new Error (`Failed to read inventory for player: ${playerId}`);
    return inventory;
}

exports.addCurrency = async (playerId, amtEarned) => {
    const result = await Inventory.findOneAndUpdate(
        {playerId},
        {$inc: {currencyBalance: amtEarned}},
        {returnDocument: "after"}
    );

    if (!result) {
        throw new Error(`Failed to add currency to player: ${playerId}`);
    }

    return result;
}

exports.buyShields = async (playerId, numberOfShields) => {
    let totalPrice = numberOfShields * prices.shields;
    const result = await Inventory.findOneAndUpdate(
        { 
            // make sure player has enough money to buy the shield 
            playerId: playerId, 
            currencyBalance: { $gte: totalPrice } // Only run if they have enough money (greater than or equal to)
        }, 
        //update
        { 
            $inc: { 
                currencyBalance: (-1 * totalPrice),
                shields: numberOfShields
            },
            $set: { lastItemPurchasedDate: Date.now() },
        },
        { returnDocument: 'after'}
    );

    if (!result) {
        throw new errors.InsufficientFundError();
    }

    return result;
}

exports.buyCoupons = async (playerId, numberofCoupons) => {
    let totalPrice = numberofCoupons * prices.coupons;
    const result = await Inventory.findOneAndUpdate(
        { 
            // make sure player has enough money to buy the shield 
            playerId: playerId, 
            currencyBalance: { $gte: totalPrice } // Only run if they have enough money (greater than or equal to)
        }, 
        //update
        { 
            $inc: { 
                currencyBalance: (-1 * totalPrice),
                numberOfCoupons: numberofCoupons
            },
            $set: { lastItemPurchasedDate: Date.now() },
        },
        { returnDocument: 'after'}
    );

    if (!result) {
        throw new errors.InsufficientFundError();
    }

    return result;
}

exports.deductCoupons = async (playerId, spendCount) => {
    const inventory = await Inventory.findOneAndUpdate(
        {
            playerId: playerId,
            numberOfCoupons : {$gte: spendCount}
        },
        {
            $inc: {numberOfCoupons: -spendCount}
        },
        { returnDocument: "after" }
    );
    if (!inventory) {
        throw new errors.InsufficientCouponsError();
    }
    return inventory;
}