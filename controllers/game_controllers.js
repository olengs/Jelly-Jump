const recordsModel = require("../models/game-records");
const UserModel = require("../models/user-model");
const scoreboardModel = require('../models/scoreboard-model');

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
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.json({ success: false });
    }
};