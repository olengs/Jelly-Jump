const recordsModel = require("../models/game-records");
const UserModel = require("../models/user-model");

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
};