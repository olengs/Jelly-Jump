const UserModel = require("../models/user-model");
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
    console.log(username, password);

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

        console.log(error);
        return
    }

    res.redirect(302, "/home");
}

const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //match {0-9A-z}1+, then @, then {0-9A-z}1+, then ., then {0-9A-z} 2+

exports.signup = async (req, res) => {
    const {email, username, password, confirmPassword} = req.body;
    console.log(email, username, password, confirmPassword);
    //input validation (empty)
    if (!email || !username || !password || !confirmPassword) {
        throw new Error("Error, login fields are empty (html is not requiring input)");
    }
    if (password != confirmPassword) {
        res.render("IAM/signup", {email, username, errorMsg: "Passwords do not match"});
        return;
    }
    if (!email.match(email_regex)){
        res.render("IAM/signup", {username, errorMsg: "Email of invalid format"});
        return
    }
    
    try {
        let user = await UserModel.createUser(username, email, password);
        req.session.user = user;
        console.log(`User created: id: ${user.id}, uname: ${user.username}, email: ${user.email}`);
    } catch (error) {
        if (error instanceof Errors.UserAlreadyExistsError) {
            res.render("IAM/signup", {email, errorMsg: error.message});
            return
        }
        if (error instanceof Errors.EmailAlreadyExistsError) {
            res.render("IAM/signup", {username, errorMsg: error.message});
            return
        }
        res.status(500).render("error", {error: "access denied"});
        console.log(error);
        return
    }
    res.redirect(302, `/login`);
}

exports.logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).render("error", {errorMsg: "Failed to logout"});
        }
        return res.redirect(302, "/login");
    });
}

exports.adminViewUsers = async (req, res) => {
    const user = req.session.user
    
}