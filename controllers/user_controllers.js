const UserModel = require("../models/user-model");
const Errors = require("../models/errors");
const bcrypt = require("bcrypt");
const InventoryModel = require("../models/inventory-model.js");
const Jellies = require("../models/jelly-model.js");
const GameRecords = require("../models/game-records.js");
const Scoreboard = require("../models/scoreboard-model.js");
const dbcommons = require("../models/dbcommons.js");

exports.loginView = (req, res) => {
    res.render("IAM/login", {});
};

exports.signupView = (req, res) => {
    res.render("IAM/signup", {});
}

exports.login = async (req, res) => {
    const {username, password} = req.body;

    try {
        if (!username || !password) throw new Error("Empty login field(s)");

        let user = await UserModel.getUserByName(username);

        let password_valid = await bcrypt.compare(password, user.passwordHash);
        if (!password_valid) throw new Errors.InvalidPasswordError();
        
        req.session.user = user;
        console.log(`Logged in with ${username}, ${password}`);

    } catch (error) {
        if (error instanceof Errors.UserNotFoundError) {
            res.render("IAM/login", {errorMsg: error.message});
            return;
        }
        if (error instanceof Errors.InvalidPasswordError) {
            //todo: add error to session for display
            res.render("IAM/login", {errorMsg: error.message});
            return;
        }

        throw error;
    }

    res.redirect(302, "/");
}

exports.signup = async (req, res) => {
    const {email, username, password, confirmPassword} = req.body;
    console.log(email, username, password, confirmPassword);
    //input validation (empty)
    if (!email || !username || !password || !confirmPassword) {
        throw new Error("Error, login fields are empty (html is not requiring input)");
    }
    if (password != confirmPassword) {
        return res.render("IAM/signup", {email, username, errorMsg: "Passwords do not match"});
    }
    

    try {
        await dbcommons.runInTransaction(async () => {
            let user = await UserModel.createUser(username, email, password);
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