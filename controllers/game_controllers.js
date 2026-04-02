const UserModel = require("../models/user-model");
const scoreboardModel = require('../models/scoreboard-model');
const GameRecordModel = require("../models/game-records");
const InventoryModel = require("../models/inventory-model");
const Jellies = require("../models/jelly-model");
const dbcommons = require("../models/dbcommons");
const InventoryErrors = require("../models/inventory-errors");

exports.gameViewController = async (req, res) => {
    //add customizable shop etc
    const user = req.session.user;
    const characterID = await Jellies.getCurrentJelly(user._id);

    res.render("game/gameview", {playerId: user._id, characterID});
};

exports.EndGameUpdateController = async (req, res) => {
    let {playerId, highscore, gameEndTime, character, jumps} = req.body;
    let endTime = new Date(gameEndTime);

    const user = await UserModel.getUserById(playerId);

    //update db with user score
    console.log(`${endTime.toISOString()}: Updating uname: ${user.username} and highscore: ${highscore} with character: ${character} into DB`);
    let amtEarned = Math.floor(highscore / 100);


    // insert score into db
    try {
        await dbcommons.runInTransaction(async () => {
            await scoreboardModel.upsertScore(playerId, highscore, jumps);
            await GameRecordModel.createRecord(playerId, endTime, highscore, character, amtEarned);
            await InventoryModel.addCurrency(playerId, amtEarned);
        });
        res.json({});
    } catch (error) {
        console.log(error);
        res.json({Error: error});
    }
};

exports.gachaViewController = async (req, res) => {
    const user = req.session.user;
    const inventory = await InventoryModel.getInventory(user._id);

    res.render("game/gacha", {playerId: user._id, coupon_count: inventory.numberOfCoupons });
};

const rebateMin = 10;
const rebateMax = 100;
const NumCharacters = 12;
const characterRate = 0.5;
let gachaPull = () => {
    let luck = Math.random();
    if (luck < characterRate) {
        return {type: "character", value: Math.floor(Math.random() * NumCharacters)};
    }
    return {type: "currency", value: Math.floor(Math.random() * (rebateMax - rebateMin) + rebateMin)};
};

exports.gachaPullRequest = async (req, res) => {
    let {playerId, pullCount} = req.body;

    let results = Array.from({length: Number(pullCount)}, (_, i) => gachaPull());
    let currencySum = results.reduce((acc, item) => {
        return acc + (item.type === "currency" ? item.value : 0);
    }, 0);
    let fragments = results.reduce((acc, item) => {
        if (item.type === "currency") return acc;
        acc[item.value] = (acc[item.value] || 0) + 1;
        return acc;
    }, {});

    console.log(currencySum, fragments);

    try {
        await dbcommons.runInTransaction(async () => {
            // make sure that player is able to afford the number of pulls
            await InventoryModel.deductCoupons(playerId, pullCount);
            // save gacha results into player inventory
            await InventoryModel.addCurrency(playerId, currencySum);
            await Jellies.incrementJellyFragments(playerId, fragments);
            //console.log(`gacha results for player ${playerId}: count: ${pullCount}, ${JSON.stringify(results)}`)
            // return to frontend for rendering
            res.json({results});
        });
    } catch (error) {
        if (error instanceof InventoryErrors.InsufficientCouponsError) {
            return res.json({Action: "refresh"});
        }

        res.json({Error: error});
        throw error;
    }


};
