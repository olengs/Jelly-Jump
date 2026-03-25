const User = require("../models/user-model");
const GameHistory = require("../models/game-records");

// read - get profile page 
async function getProfile(req, res){
    try { 
        if (!req.session.user){
            return res.redirect("/login");
        }
        const userID = req.session.user._id; 
        const user = await User.getUserById(userID);

        res.render("user-profile", {user: user, error: null});
    } catch (error) {
        console.error(error);
        res.render("user-profile", {user: null, error:"Something went wrong."});
    }
};

// update - edit profile form 
async function getEditProfile(req, res){
    try {
        if (!req.session.user){
            return res.redirect("/login");
        }
        const userID = req.session.user._id;
        const user = await User.getUserById(userID);

        res.render("edit-profile", {user: user, error: null});
    } catch (error) {
        console.error(error);
        res.redirect("/profile");
    }
}

// update - handle edit profile submission 
async function postEditProfile(req, res){
    try {
        if (!req.session.user){
            return res.redirect("/login")
        }

        const userID = req.session.user._id;
        const username = req.body.username; 
        const bio = req.body.bio;  

        if (!username){
            const user = await User.getUserById(userID);
            return res.render("edit-profile", {user: user, error: "Username cannot be empty."});
        }

        await User.updateUser(userID, username, bio);

        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.redirect("/profile");
    }
}

// delete - delete user account 
async function deleteProfile(req, res){
    try {
        if (!req.session.user){
            return res.redirect("/login");
        }

        const userID = req.session.user._id;
        await GameHistory.deleteAllRecordsByUser(userID);
        await User.deleteUser(userID);
        
        // clear the session 
        req.session.destroy(() => {
            res.redirect("/")
        });
    } catch (error) {
        console.error(error);
        res.redirect("/profile");
    }
}

// read - get game history page 
async function getHistory(req, res){
    try {
        if (!req.session.user){
            return res.redirect("/login");
        }

        const userID = req.session.user._id; 
        const user = await User.getUserById(userID);
        const history = await GameHistory.getPlayerHistory(userID); 

        res.render("player-history", {user: user, history: history, error: null});
    } catch (error) {
        console.error(error); 
        res.render("player-history", {user: null, history: [], error: "Something went wrong."});
    }
}

// delete - delete a single history entity 
async function deleteHistory(req, res){
    try {
        if (!req.session.user){
            return res.redirect("/login"); 
        }

        const userID = req.session.user._id;
        await GameHistory.deleteRecord(req.params.id, userID); 
        res.redirect("/history");
    } catch (error) {
        console.error(error); 
        res.redirect("/history");
    }
}

module.exports = {getProfile, getEditProfile, postEditProfile, deleteProfile, getHistory, deleteHistory};