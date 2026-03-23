


exports.gameViewController = (req, res) => {
    //add customizable shop etc
    const user = req.session.user;
    res.render("game/gameview", {UUID: user.UUID});
};

exports.EndGameUpdateController = (req, res) => {
    let {UUID, highscore, gameEndTime} = req.body;
    let endTime = new Date(gameEndTime);

    //update db with user score
    console.log(`${endTime.toISOString()}: Updating UUID: ${UUID} and highscore: ${highscore} into DB`);
};