const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");


const inventorySchema = new mongoose.Schema({
    playerId: {type: String, required: true},
    currencyEarned: {type: Number, required: true, default: 0},
    currentEquippedCharacter: {},
    couponNum: {type: Number, required: true, default: 0},
    characters: {type: String, required: true, default: "0"},

});

const Inventory = mongoose.model("Inventory", inventorySchema, "inventory");

