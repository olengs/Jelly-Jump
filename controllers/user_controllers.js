const UserModel = require("../models/user-model");
const InventoryModel = require("../models/inventory-model.js");
const Errors = require("../models/errors");
const bcrypt = require("bcrypt");
const JelliesModel = require("../models/jelly-model.js");

exports.loginView = (req, res) => {
    res.render("IAM/login", {errorMsg: null});
};

exports.signupView = (req, res) => {
    res.render("IAM/signup", {errorMsg: null});
}

exports.login = async (req, res) => {
    const {username, password} = req.body;

    try {
        if (!username || !password) throw new Error("Empty login field(s)");

        // check if account is locked
        const locked = await UserModel.isLocked(username);
        if (locked) {
            return res.render("IAM/login", {errorMsg: "Account is locked. Please try again after 30 seconds."})
        }

        let user = await UserModel.getUserByName(username);
        let password_valid = await bcrypt.compare(password, user.passwordHash);


        if (!password_valid){
            await UserModel.incrementLoginAttempts(username); 
            let updatedUser = await UserModel.getUserByName(username);
            let attemptsLeft = 3 - updatedUser.loginAttempts;
            if (attemptsLeft<=0){
                return res.render("IAM/login", {errorMsg: "Account locked. Please try again after 30 seconds."});
            }
            return res.render("IAM/login", {errorMsg: `Invalid password. ${attemptsLeft} attempt(s) left.`});
        }
        
        await UserModel.resetLoginAttempts(username);
        req.session.user = user;
        

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
    const {email, username, password, confirmPassword, securityQuestion, securityAnswer} = req.body;
    console.log(email, username, password, confirmPassword, securityQuestion, securityAnswer);
    //input validation (empty)
    if (!email || !username || !password || !confirmPassword || !securityQuestion || !securityAnswer) {
        throw new Error("Error, login fields are empty (html is not requiring input)");
    }
    if (password != confirmPassword) {
        return res.render("IAM/signup", {email, username, errorMsg: "Passwords do not match"});
    }
    
    let user; let inventory;
    try {
        user = await UserModel.createUser(username, email, password, securityQuestion, securityAnswer);
        inventory = await InventoryModel.createInventory(user._id);
        jellies = await JelliesModel.createJellyStore(user._id);
        req.session.user = user;
        console.log(`User created: id: ${user.id}, uname: ${user.username}, email: ${user.email}`);
    } catch (error) {

        if (jellies) await JelliesModel.deleteUser(user._id);
        if (inventory) await InventoryModel.deleteUser(user._id);
        if (user) await UserModel.deleteUser(user._id);

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