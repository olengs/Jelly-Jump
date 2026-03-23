const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");
const {sleep} = require("../utilities/utilities");
const errors = require("./errors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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
    let dbuser = new User({username, email, passwordHash});

    return await dbuser.save();
}

exports.getUserByName = async (username) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    let user = await User.findOne({username});
    if (!user) throw new errors.UserNotFoundError(username);

    return user;
}

exports.getUserById = async (id) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    let user = await User.findById(id);
    if (!user) throw new errors.UserNotFoundError(id);

    return user;
}

// create reset password for update
exports.updateUserPassword = async (username, oldPassword, newPassword) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    let user = await User.findOne({username});
    if (!await bcrypt.compare(oldPassword, user.passwordHash)) throw new errors.InvalidPasswordError();

    user.passwordHash = await bcrypt.hash(newPassword, Math.floor(Math.random() * 10));
    return await user.save();
}

// create delete account for delete
exports.deleteUserPassword = async (username) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    return await User.deleteOne({username});
}

exports.findUsersByStr = async (partialName) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
}