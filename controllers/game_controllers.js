const UserModel = require("../models/user-model");
const scoreboardModel = require('../models/scoreboard-model');
const GameRecordModel = require("../models/game-records");

exports.gameViewController = (req, res) => {
    //add customizable shop etc
    const user = req.session.user;
    const characterID = 0;

    res.render("game/gameview", {playerId: user._id, characterID});
};

exports.EndGameUpdateController = async (req, res) => {
    let {playerId, highscore, gameEndTime, character} = req.body;
    let endTime = new Date(gameEndTime);

    const user = await UserModel.getUserById(playerId);

    //update db with user score
    console.log(`${endTime.toISOString()}: Updating uname: ${user.username} and highscore: ${highscore} with character: ${character} into DB`);

    // insert score into db
    try {
        await scoreboardModel.upsertScore(playerId, user.username, highscore);
        await GameRecordModel.createRecord(playerId, endTime, highscore, character, 0);
        res.json({});
    } catch (error) {
        console.log(error);
        res.json({ Error: error });
    }
};

exports.gachaViewController = (req, res) => {
    const user = req.session.user;
    res.render("game/gacha", {playerId: user._id});
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

    // make sure that player is able to afford the number of pulls
    //res.json({error: ""})

    let results = Array.from({length: Number(pullCount)}, (_, i) => gachaPull());
    // save gacha results into player inventory first

    console.log(`gacha results for player ${playerId}: count: ${pullCount}, ${JSON.stringify(results)}`)
    // return to frontend for rendering
    res.json({results});
};
