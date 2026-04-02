const User = require("../models/user-model");
const GameRecords = require("../models/game-records");
const errors = require("../models/errors");
const Inventory = require("../models/inventory-model");
const Scoreboard = require("../models/scoreboard-model");

exports.getProfile = async (req, res) => {
    const user = req.session.user;

    if (user._id == req.params.id) {
        console.log(user._id, req.params.id);
        return res.redirect(302, "/profile");
    }

    // //show highscore only
    // let highscore = await Scoreboard.getHighscore();

    res.render("profile/user-profile", {user: await User.getUserById(req.params.id)});
};

exports.getOwnProfile = async (req, res) => {
    // let inventory = await Inventory.getInventory();
    // let highscore = await Scoreboard.getHighscore();
    //show inventory stuff
    
    res.render("profile/user-profile", {user: req.session.user});
}

exports.getEditProfile = async (req, res) => {
    const user = req.session.user;
    res.render("profile/edit-profile", {user: user, error: null});
}

// update - handle edit profile submission 
exports.postEditProfile = async (req, res) => {
    const { newUsername , newBio } = req.body;
    try {
        await User.updateUser(req.session.user._id, newBio, req.session.user.username == newUsername ? null : newUsername);
    } catch (error) {
        if (error instanceof errors.UserAlreadyExistsError) {
            return res.render("profile/edit-profile", {user: req.session.user, errorMsg: error.message});
        } else if (error instanceof errors.UsernameFormatError) {
            return res.render("profile/edit-profile", {user: req.session.user, errorMsg: error.message});
        }
        // rethrow back to main handler
        throw error;
    }
    return res.redirect("/profile");
}

// delete - delete user account 
exports.deleteProfile = async (req, res) => {
    await GameRecords.deleteAllRecordsByUser(req.session.user._id);
    await User.deleteUser(req.session.user._id);

    res.redirect("/logout");
}

// read - get game history page 
exports.getHistory = async (req, res) => {
    const userID = req.session.user._id; 
    const user = await User.getUserById(userID);
    const history = await GameRecords.getPlayerHistory(userID);
    res.render("profile/player-history", {user: user, history: history, error: null});
}

// delete - delete a single history entity 
exports.deleteHistory = async (req, res) => {
    await GameRecords.deleteRecord(req.params.id, req.session.user._id); 
    res.redirect("/history");
}