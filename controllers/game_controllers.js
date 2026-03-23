const recordsModel = require("../models/game-records");

exports.gameViewController = (req, res) => {
    //add customizable shop etc
    const user = req.session.user;
    const characterID = 0;
    res.render("game/gameview", {UUID: user.UUID, characterID});
};

exports.EndGameUpdateController = (req, res) => {
    let {playerUID, highscore, gameEndTime, character} = req.body;
    let endTime = new Date(gameEndTime);

    //update db with user score
    console.log(`${endTime.toISOString()}: Updating UUID: ${playerUID} and highscore: ${highscore} with character: ${character} into DB`);
};