const jellyModel = require("../models/jelly-model")

exports.showJellies = async (req,res) => {
    const jellyData = await jellyModel.getJelliesByPlayerId(req.session.user._id);
    console.log("jelly data: ", jellyData);

    return res.render('jelly', {jellyData: JSON.stringify(jellyData), error:''});
}

exports.upgrade = async (req, res) => {
    const {jellyId} = req.body;

    jellyModel.upgradeJelly(req.session.user._id, jellyId);
    res.redirect(302, "/jellies");
}