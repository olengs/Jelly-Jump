const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const Errors = require("../models/errors");


exports.loginView = (req, res) => {
    res.render("IAM/login", {});
};

exports.signupView = (req, res) => {
    res.render("IAM/signup", {});
}

exports.login = async (req, res) => {
    const {username, password} = req.body;
    console.log(username, password);

    try {
        if (!username || !password) throw new Error("Empty login field(s)");

        let user = await UserModel.getUserByName(username);

        let password_valid = await bcrypt.compare(password, user.passwordHash);
        if (!password_valid) throw new Errors.InvalidPasswordError();
        // todo: establish session and save cookie on user side to persist session for x duration

        console.log(`Logged in with ${username}, ${password}`);
    } catch (error) {
        if (error instanceof Errors.UserNotFoundError) {
            res.redirect(302, "/login");
            return;
        }
        if (error instanceof Errors.InvalidPasswordError) {
            //todo: add error to session for display
            res.redirect(302, "/login");
        }

        console.log(error);
        return
    }

    res.redirect(302, "/home");
}

exports.signup = async (req, res) => {
    const {email, username, password, confirmPassword} = req.body;
    console.log(email, username, password, confirmPassword);
    //input validation (empty)
    if (!email || !username || !password || !confirmPassword) {
        throw new Error("Error, login fields are empty (html is not requiring input)");
    }
    if (password != confirmPassword) {
        res.render("IAM/signup", {email, username, password, confirmPassword, errorMsg: "Passwords are not equal"});
        return;
    }
    
    let user;
    try {
        user = await UserModel.createUser(username, email, await bcrypt.hash(password, Math.floor(Math.random() * 10) ));
        console.log(`User created: id: ${user.id}, uname: ${user.username}, email: ${user.email}`);
    } catch (error) {
        if (error instanceof Errors.UserAlreadyExistsError) {
            res.render("IAM/signup", {email, username, errorMsg: error.message});
            return
        }
        if (error instanceof Errors.EmailAlreadyExistsError) {
            res.render("IAM/signup", {email, username, errorMsg: error.message});
            return
        }
        res.status(500).render("error", {error: "access denied"});
        console.log(error);
        return
    }
    res.redirect(302, `/login`);
}