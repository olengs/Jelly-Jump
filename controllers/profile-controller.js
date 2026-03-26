const User = require("../models/user-model");
const GameRecords = require("../models/game-records");

// read - get profile page 
exports.getProfile = async (req, res) => {
    try {
        // get logged in userid from session (jc login)
        const userId = req.session?.user?.id;

        if (!userId){
            return res.redirect("/login");
        }

        res.render("user-profile", {user: user, error: null});
    } catch (error) {
        console.error(error);
        res.render("user-profile", {user: null, error:"Something went wrong."});
    }
};

// update - edit profile form 
exports.getEditProfile = async (req, res) => {
    try {
        const userID = req.session.user.id; 

        if (!userID){
            return res.redirect("/login");
        }

        const user = await User.getUserById(userID);
        res.render("edit-profile", {user: user, error: null});

    } catch (error) {
        console.error(error);
        res.redirect("/profile");
    }
}

// update - handle edit profile submission 
exports.postEditProfile = async (req, res) => {
    try {
        const userID = req.session.user._id;

        if (!userID){
            return res.redirect("/login")
        }

        const username = req.body.username; 
        const bio = req.body.bio;  

        if (!username){
            const user = await User.getUserById(userID);
            return res.render("edit-profile", {user: user, error: "Username cannot be empty."});
        }

        await User.updateUser(userID, {username, bio});

        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.redirect("/profile");
    }
}

// delete - delete user account 
exports.deleteProfile = async (req, res) => {
    try {
        const userID = req.session.user._id;

        if (!userID){
            return res.redirect("/login");
        }

        await GameRecords.deleteAllRecordsByUser(userID.toString());
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
exports.getHistory = async (req, res) => {
    try {
        if (!req.session.user){
            return res.redirect("/login");
        }

        const userID = req.session.user._id; 
        const user = await User.getUserById(userID);
        const history = await GameRecords.getPlayerHistory(userID.toString());

        res.render("player-history", {user: user, history: history, error: null});
    } catch (error) {
        console.error(error); 
        res.render("player-history", {user: null, history: [], error: "Something went wrong."});
    }
}

// delete - delete a single history entity 
exports.deleteHistory = async (req, res) => {
    try {
        const userID = req.session.user.id;
        await GameRecords.deleteRecord(req.params.id, userID.toString()); 
        res.redirect("/history");
    } catch (error) {
        console.error(error); 
        res.redirect("/history");
    }
}