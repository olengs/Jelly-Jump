const mongoose = require("mongoose");
const {sleep} = require("../utilities/sleep");

function isDBConnected() {
    return mongoose.STATES[mongoose.connection.readyState] == "connected"
}

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique:true},
    passwordHash: {type: String, required: true, unique:true},
    records: []
})

class DatabaseNotConnectedError extends Error{
    constructor(){
        super("Database not connected");
        this.statusCode = 500 // status: internal server error
    }
}

class UserAlreadyExistsError extends Error{
    constructor(username){
        super(`username ${username} already exists`);
        this.username = username;
        this.statusCode = 400; //status: bad request
    }
}

class UserNotFoundError extends Error {
    constructor(username) {
        super(`Username not found`);
        this.username = username;
        this.statusCode = 400; //status: bad request
    }
}

class EmailAlreadyExistsError extends Error {
    constructor(email){
        super(`Email ${email} already exists`);
        this.statusCode = 400; //status: bad request
    }
}

class InvalidPasswordError extends Error {
    constructor(){
        super("Password is invalid");
        this.statusCode = 400;
    }
}

const User = mongoose.model('User', userSchema, "users");

const databaseError = new DatabaseNotConnectedError();

let createUser = async (username, email, passwordHash) => {
    if (!isDBConnected()) {
        throw databaseError;
    }

    username_exists = User.findOne({username})
    email_exists = User.findOne({email})

    if (await username_exists) {
        throw new UserAlreadyExistsError(username);
    }

    if (await email_exists) {
        throw new EmailAlreadyExistsError(email);
    }

    let dbuser = new User({username, email, passwordHash});

    return await dbuser.save();;
}

let getUserByName = async (username) => {
    if (!isDBConnected()) {
        throw databaseError;
    }

    let user = await User.findOne({username});
    if (!user) {
        throw new UserNotFoundError();
    }

    return user;
}

// exporting everything
module.exports = {
    DatabaseNotConnectedError,
    UserAlreadyExistsError,
    UserNotFoundError,
    EmailAlreadyExistsError,
    InvalidPasswordError,
    createUser,
    getUserByName,
    User,
}