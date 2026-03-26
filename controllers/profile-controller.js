const User = require("../models/user-model");
const GameRecords = require("../models/game-records");

// read - get profile page 
async function getProfile(req, res){
    try {
        // get logged in userid from session (jc login)
        const userID = req.session.user._id; 
        if (!userID){
            return res.redirect("/login");
        }
        const user = await User.findByID(userID);
        res.render("profile", {user: user, error: null});
    } catch (error) {
        console.error(error);
        res.render("profile", {user: null, error:"Something went wrong."});
    }
}

// update - edit profile form 
async function getEditProfile(req, res){
    try {
        const userID = req.session.user._id; 

        if (!userID){
            return res.redirect("/login");
        }

        const user = await User.findByID(userID);
        res.render("edit-profile", {user: user, error: null});
    } catch (error) {
        console.error(error);
        res.redirect("/profile");
    }
}

// update - handle edit profile submission 
async function postEditProfile(req, res){
    try {
        const userID = req.session.user._id;

        if (!userID){
            return res.redirect("/login")
        }

        const username = req.body.username; 
        const bio = req.body.bio; 
        const nickname = req.body.nickname; 

        if (!username){
            const user = await findByID(userID);
            return res.render("edit-profile", {user: user, error: "Username cannot be empty."});
        }

        await User.findByIDAndUpdate(userID, {username: username, bio: bio, nickname: nickname});

        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.redirect("/profile");
    }
}

// delete - delete user account 
async function deleteProfile(req, res){
    try {
        const userID = req.session.user._id;

        if (!userID){
            return res.redirect("/login");
        }

        await User.findByIDAndDelete(userID);
        await PlayerHistory.deleteMany({playerId: userID});

        // clear the session 
        req.session.destroy();
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.redirect("/profile");
    }
}

// read - get game history page 
async function getHistory(req, res){
    try {
        console.log(req.session.user);
        const userID = req.session.user?.id; 

        if (!userID){
            return res.redirect("/login");
        }

        const user = await User.findByID(userID);
        const history = await GameRecords.find({playerId: userID}).sort({timestamp: -1}); 

        res.render("player-history", {user: user, history: history, error: null});
    } catch (error) {
        console.error(error); 
        res.render("player-history", {user: null, history: [], error: "Something went wrong."});
    }
}

// delete - delete a single history entity 
async function deleteHistory(req, res){
    try {
        const userID = req.session.user.id; 

        if (!userID){
            return res.redirect("/login"); 
        }

        await GameRecords.findByIDAndDelete(req.params.id); 
        res.redirect("/player-history");
    } catch (error) {
        console.error(error); 
        res.redirect("/player-history");
    }
}

module.exports = {getProfile, getEditProfile, postEditProfile, deleteProfile, getHistory, deleteHistory};