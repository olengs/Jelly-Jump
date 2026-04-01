const UserModel = require("../models/user-model");
const InventoryModel = require("../models/inventory-model.js");
const Errors = require("../models/errors");
const bcrypt = require("bcrypt");

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
        let user = await UserModel.createUser(username, email, password);
        let inventory = await InventoryModel.createInventory(user.id);
        console.log(`Inventory created for user id : ${inventory.playerId}`);
        req.session.user = user;
        console.log(`User created: id: ${user.id}, uname: ${user.username}, email: ${user.email}`);
    } catch (error) {
        if (error instanceof Errors.UserAlreadyExistsError || error instanceof Errors.UsernameFormatError) {
            return res.render("IAM/signup", {email, errorMsg: error.message});
        }
        else if (error instanceof Errors.EmailAlreadyExistsError || error instanceof Errors.EmailFormatError) {
            return res.render("IAM/signup", {username, errorMsg: error.message});
        }
        else if (error instanceof Errors.PasswordFormatError) {
            return res.render("IAM/signup", {username, email, errorMsg: error.message});
        }
        throw error;
    }
    res.redirect(302, `/login`);
}

exports.logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            throw err;
        }
        return res.redirect(302, "/login");
    });
}