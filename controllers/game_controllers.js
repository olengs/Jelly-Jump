const recordsModel = require("../models/game-records");

exports.gameViewController = (req, res) => {
    //add customizable shop etc
    const user = req.session.user;
    const character = 0;
    res.render("game/gameview", {UUID: user.UUID, character});
};

exports.EndGameUpdateController = (req, res) => {
    let {UUID, highscore, gameEndTime, character} = req.body;
    let endTime = new Date(gameEndTime);

    //update db with user score
    console.log(`${endTime.toISOString()}: Updating UUID: ${UUID} and highscore: ${highscore} into DB`);
};