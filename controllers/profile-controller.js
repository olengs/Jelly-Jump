const User = require("../models/user-model");
const GameRecords = require("../models/game-records");

// read - get profile page 
exports.getProfile = async (req, res) => {
    try {
        // get logged in userid from session (jc login)
        const user = req.session?.user;

        if (!user){
            return res.redirect("/login");
        }

        res.render("profile/user-profile", {user, error: null});
    } catch (error) {
        console.error(error);
        res.render("profile/user-profile", {user: null, error:"Something went wrong."});
    }
};

// update - edit profile form 
exports.getEditProfile = async (req, res) => {
    const user = req.session?.user;
    res.render("profile/edit-profile", {user: user, error: null});
}

// update - handle edit profile submission 
exports.postEditProfile = async (req, res) => {
    //TODO: missing post body.
    
    try {
        await User.updateUser(userID, {username, bio});
        return res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.redirect("/profile");
    }
}

// delete - delete user account 
exports.deleteProfile = async (req, res) => {

    let userId = req.session?.user?._id;

    try {
        await GameRecords.deleteAllRecordsByUser(userId.toString());
        await User.deleteUser(userId);

        // clear the session 
        req.session.destroy(() => {
            res.redirect("/signup")
        });

    } catch (error) {
        console.error(error);
        res.status(500).render("error", {statusCode: 500});
    }
}

// read - get game history page 
exports.getHistory = async (req, res) => {
    try {
        const userID = req.session.user._id; 
        const user = await User.getUserById(userID);
        const history = await GameRecords.getPlayerHistory(userID.toString());
        res.render("profile/player-history", {user: user, history: history, error: null});
    } catch (error) {
        console.error(error); 
        res.status(500).render("error", {statusCode: 500});
    }
}

// delete - delete a single history entity 
exports.deleteHistory = async (req, res) => {
    try {
        const userID = req.session.user.id;
        await GameRecords.deleteRecord(req.params.id, userID.toString()); 
        res.redirect("/history");
    } catch (error) {
        console.log(error);
        res.status(500).render("error", {statusCode: 500});
    }
}