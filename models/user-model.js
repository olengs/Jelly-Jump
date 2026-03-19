const mongoose = require("mongoose");
const {sleep} = require("../utilities/sleep");
const errors = require("./errors");

function isDBConnected() {
    return mongoose.STATES[mongoose.connection.readyState] == "connected"
}

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique:true},
    passwordHash: {type: String, required: true, unique:true},
    records: []
})

const User = mongoose.model('User', userSchema, "users");
exports.User = User;

const databaseError = new errors.DatabaseNotConnectedError();

exports.createUser = async (username, email, passwordHash) => {
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

    let dbuser = new User({username, email, passwordHash});

    return await dbuser.save();;
}

exports.getUserByName = async (username) => {
    if (!isDBConnected()) {
        throw databaseError;
    }

    let user = await User.findOne({username});
    if (!user) {
        throw new UserNotFoundError();
    }

    return user;
}