const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");
const errors = require("./errors");
const bcrypt = require("bcrypt");



const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique:true, trim:true},
    passwordHash: {type: String, required: true, unique:true},
    role: {type: String, required: true, enum: ["admin", "player"], default:"player"},
    bio: {type: String, required: true, default: "My bio"},
    friends :[{
        friendname:String,
        username:String 
    }] })

const User = mongoose.model('User', userSchema, "users");
exports.User = User;

exports.createUser = async (username, email, password) => {
    if (!dbcommons.isDBConnected()) {
        throw databaseError;
    }

    username_exists = User.findOne({username})
    email_exists = User.findOne({email})

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