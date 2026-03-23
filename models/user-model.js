const mongoose = require("mongoose");
const {sleep} = require("../utilities/sleep");
const errors = require("./errors");
const bcrypt = require("bcrypt");

function isDBConnected() {
    return mongoose.STATES[mongoose.connection.readyState] == "connected"
}

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique:true},
    passwordHash: {type: String, required: true, unique:true},
})

const User = mongoose.model('User', userSchema, "users");
exports.User = User;

const databaseError = new errors.DatabaseNotConnectedError();

exports.createUser = async (username, email, password) => {
    if (!isDBConnected()) {
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
    let passwordHash = await bcrypt.hash(password, Math.floor(Math.random() * 10) );
    let dbuser = new User({username, email, passwordHash});

    return await dbuser.save();
}

exports.getUserByName = async (username) => {
    if (!isDBConnected()) throw databaseError;

    let user = await User.findOne({username});
    if (!user) throw new errors.UserNotFoundError(username);

    return user;
}

// create reset password for update
exports.updateUserPassword = async (username, oldPassword, newPassword) => {
    if (!isDBConnected()) throw databaseError;

    let user = await User.findOne({username});
    if (!await bcrypt.compare(oldPassword, user.passwordHash)) throw new errors.InvalidPasswordError();

    user.passwordHash = await bcrypt.hash(newPassword, Math.floor(Math.random() * 10));
    return await user.save();
}

// create delete account for delete
exports.deleteUserPassword = async (username) => {
    if (!isDBConnected) throw databaseError;

    return await User.deleteOne({username});
}