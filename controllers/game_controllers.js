exports.gameViewController = (req, res) => {
    //add customizable shop etc
    res.render("game/gameview", {});
};

exports.EndGameUpdateController = (req, res) => {
    let {userId, highscore, gameEndTime} = req.body;
    let endTime = new Date(gameEndTime);

    //update db with user score
    console.log(`${endTime.toISOString()}: Updating userId: ${userId} and highscore: ${highscore} into DB`);
};