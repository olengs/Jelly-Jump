const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");
const errors = require("./errors");
const bcrypt = require("bcrypt");

const email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //match {0-9A-z}1+, then @, then {0-9A-z}1+, then ., then {0-9A-z} 2+
const username_regex = /^[a-zA-Z0-9]{4,12}$/;
const password_regex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9\s])(?!.*\s).{8,}$/

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique:true, trim:true},
    passwordHash: {type: String, required: true, unique:true},
    role: {type: String, required: true, enum: ["admin", "player"], default:"player"},
    bio: {type: String, required: true, default: "My bio"},
})

const User = mongoose.model('User', userSchema, "users");
exports.User = User;

exports.createUser = async (username, email, password) => {
    if (!email.match(email_regex)){
        throw new errors.EmailFormatError();
    }
    if (!username.match(username_regex)) {
        throw new errors.UsernameFormatError();
    }

    if (!password.match(password_regex)) {
        throw new errors.PasswordFormatError();
    }

    if (!dbcommons.isDBConnected()) {
        throw dbcommons.databaseError;
    }

    const username_exists = User.findOne({username}).lean();
    const email_exists = User.findOne({email}).lean();

    if (await username_exists) {
        throw new errors.UserAlreadyExistsError(username);
    }

    if (await email_exists) {
        throw new errors.EmailAlreadyExistsError(email);
    }
    let passwordHash = await bcrypt.hash(password, Math.floor(Math.random() * 10));
    let dbuser = await User.create({username, email, passwordHash});

    return dbuser;
}

exports.getUserByName = async (username) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    let user = await User.findOne({username}).lean();
    if (!user) throw new errors.UserNotFoundError(username);

    return user;
}

exports.getUserById = async (id) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    let user = await User.findById(id).lean();
    if (!user) throw new errors.UserNotFoundError(id);

    return user;
}

// create reset password for update
exports.updateUserPassword = async (username, oldPassword, newPassword) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    let user = await User.findOne({username}).lean();
    if (!await bcrypt.compare(oldPassword, user.passwordHash)) throw new errors.InvalidPasswordError();

    let newPasswordHash = await bcrypt.hash(newPassword, Math.floor(Math.random() * 10));
    return await User.updateOne({username}, {passwordHash: newPasswordHash});
}

// create delete account for delete
exports.deleteUserPassword = async (username) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    return await User.deleteOne({username});
}

exports.findUsersByStr = async (partialName, filters = {}) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    //using custom leveinstein distance to do search 
    // -- DO NOT USE THIS IN A NORMAL PROJECT, THIS METHOD IS VERY SLOW AS IT QUERIES THE WHOLE DB
    // -- THIS IS ONLY DONE BECAUSE I AM UNABLE TO IMPORT OTHER PACKAGES DUE TO PROJECT CONSTRAINTS
    // - JC
    const filterAfterDistance = 5;
    let similarNames = (await User.find(filters || {})).sort(
        (a, b) => utilities.levenshteinDist(partialName, a) - utilities.levenshteinDist(partialName, b)).filter(
            a => utilities.levenshteinDist(partialName, a) < filterAfterDistance);
    console.log(similarNames);
}

exports.updateUser = async (id, username, bio) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    let username_exists = User.findOne({username}).lean();

    if (await username_exists) throw errors.UserAlreadyExistsError();
    if (!username.match(username_regex)) throw errors.UsernameFormatError();

    return await User.findByIdAndUpdate(id, {username, bio}, {new: true});
}

exports.deleteUser = async (id) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    return await User.findByIdAndDelete(id);
}