const jellyModel = require("../models/jelly-model")

exports.showJellies = async (req,res) => {
    let jellyData = await jellyModel.getJelliesByPlayerId(req.session.user._id);
    jellyData = jellyModel.addUpgradeRequirementsForJellies(jellyData);
    //console.log("jelly data: ", jellyData);

    return res.render('jelly', {jellyData, error:''});
}

exports.upgrade = async (req, res) => {
    const {jellyId} = req.body;

    await jellyModel.upgradeJelly(req.session.user._id, jellyId);
    res.redirect(302, "/jellies");
}

exports.edit = async (req, res) => {
    const {jellyId, newNickname} = req.body;

    await jellyModel.renameJelly(req.session.user._id, jellyId, newNickname);
    res.redirect("/jellies");
}

exports.updateCharacter = async (req, res) => {
    const {jellyId} = req.body;

    await jellyModel.updateCurrentJelly(req.session.user._id, jellyId);
    res.redirect("/jellies");
}