const UserModel = require("../models/user-model");
const Errors = require("../models/errors");
const bcrypt = require("bcrypt");
const InventoryModel = require("../models/inventory-model.js");
const Jellies = require("../models/jelly-model.js");
const GameRecords = require("../models/game-records.js");
const Scoreboard = require("../models/scoreboard-model.js");
const dbcommons = require("../models/dbcommons.js");

exports.loginView = (req, res) => {
    res.render("IAM/login", {islocked: false});
};

exports.signupView = (req, res) => {
    res.render("IAM/signup", {});
}

exports.login = async (req, res) => {
    const {username, password} = req.body;

    try {
        if (!username || !password) throw new Error("Empty login field(s)");

        // check if account is locked
        const locked = await UserModel.isLocked(username);
        if (locked) {
            return res.render("IAM/login", {errorMsg: "Account is locked. Please try again after 30 seconds.", islocked: true})
        }

        let user = await UserModel.getUserByName(username);
        let password_valid = await bcrypt.compare(password, user.passwordHash);


        if (!password_valid){
            await UserModel.incrementLoginAttempts(username); 
            let updatedUser = await UserModel.getUserByName(username);
            let attemptsLeft = 3 - updatedUser.loginAttempts;
            if (attemptsLeft<=0){
                return res.render("IAM/login", {errorMsg: "Account locked. Please try again after 30 seconds.", islocked: true});
            }
            return res.render("IAM/login", {errorMsg: `Invalid password. ${attemptsLeft} attempt(s) left.`, islocked: false});
        }
        
        await UserModel.resetLoginAttempts(username);
        req.session.user = user;
        
    } catch (error) {
        if (error instanceof Errors.UserNotFoundError) {
            res.render("IAM/login", {errorMsg: error.message, islocked: false});
            return;
        };

        if (error instanceof Errors.InvalidPasswordError) {
            res.render("IAM/login", {errorMsg: error.message, islocked: false});
            return;
        };

        throw error;
    }

    res.redirect(302, "/");
}

exports.signup = async (req, res) => {
    const {email, username, password, confirmPassword, securityAnswer} = req.body;
    console.log("user signed up:", email, username, password, confirmPassword, securityAnswer);
    //input validation (empty)
    if (!email || !username || !password || !confirmPassword || !securityAnswer) {
        throw new Error("Error, login fields are empty (html is not requiring input)");
    }
    if (password != confirmPassword) {
        return res.render("IAM/signup", {email, username, errorMsg: "Passwords do not match"});
    }
    

    try {
        await dbcommons.runInTransaction(async () => {
            let user = await UserModel.createUser(username, email, password, securityAnswer);
            await InventoryModel.createInventory(user._id);
            await Jellies.createJellyStore(user._id);
            req.session.user = user;
            //console.log(`User created: id: ${user.id}, uname: ${user.username}, email: ${user.email}`);
        });
    } catch (error) {
        if (error instanceof Errors.UserAlreadyExistsError || error instanceof Errors.UsernameFormatError) {
            return res.render("IAM/signup", {email, errorMsg: error.message});
        } else if (error instanceof Errors.EmailAlreadyExistsError || error instanceof Errors.EmailFormatError) {
            return res.render("IAM/signup", {username, errorMsg: error.message});
        } else if (error instanceof Errors.PasswordFormatError) {
            return res.render("IAM/signup", {username, email, errorMsg: error.message});
        }

        console.log(error);
        return res.render("IAM/signup", {errorMsg: "Failed to create user"});
    }
    res.redirect(302, `/login`);
}

exports.logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            throw err;
        }
        return res.redirect(302, "/");
    });
}

exports.forgotPasswordView = (req, res) => {
    res.render("IAM/forgot-password", {errorMsg: null, username: null});
}

exports.forgotPassword = async (req, res) => {
    const {username, securityAnswer, newPassword, confirmPassword} = req.body;

    try {
        if (!username || !securityAnswer || !newPassword || !confirmPassword){
            return res.render("IAM/forgot-password", {errorMsg: "All fields are required.", username});
        }
        if (newPassword !== confirmPassword){
            return res.render("IAM/forgot-password", {errorMsg: "Passwords do not match.", username});
        }
        const isCorrect = await UserModel.verifySecurityAnswer(username, securityAnswer);
        if (!isCorrect) {
            return res.render("IAM/forgot-password", {errorMsg: "Wrong security answer.", username});
        }

        await UserModel.resetPassword(username, newPassword);
        res.redirect("/login");
    } catch (error) {
        if (error instanceof Errors.UserNotFoundError) {
            return res.render("IAM/forgot-password", {errorMsg: "User not found.", username});
        }
        console.log(error);
        res.render("IAM/forgot-password", {errorMsg: "Something went wrong.", username});
    }
}

exports.checkSysadminUser = () => {
    return UserModel.checkAndCreateSysadminUser();
}

exports.deleteUser = async (req, res) => {
    const userid = req.session.user._id;

    await dbcommons.runInTransaction(async () => {
        await GameRecords.deleteAllRecordsByUser(userid);
        await InventoryModel.deleteInventory(userid);
        await Jellies.deleteJellies(userid);
        await Scoreboard.deleteScore(userid);
        await UserModel.deleteUser(userid);
    });

    res.redirect("/logout");
}

exports.viewAllUsers = async (req, res) => {
    res.render("profile/sysadmin-view", {users: await UserModel.getAllUsers()});
}

exports.makeAdmin = async (req, res) => {
    const {userId} = req.body;
    await UserModel.makeRole(userId, "admin");
    res.redirect(302, "/profile/viewall");
}

exports.makeUser = async (req, res) => {
    const {userId} = req.body;
    await UserModel.makeRole(userId, "player");
    res.redirect(302, "/profile/viewall");
}