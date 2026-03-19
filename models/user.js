const mongoose = require("mongoose");
const {sleep} = require("../utilities/sleep");

isDBConnected = () => {
    return mongoose.STATES[mongoose.connection.readyState] == "connected"
}

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique:true},
    passwordHash: {type: String, required: true, unique:true},
    records: []
})

const User = mongoose.model('User', userSchema);
exports.User = User;

exports.createUser =  async (username, email, passwordHash) => {
    if (!isDBConnected()) {
        throw new Error("Database is not connected");
    }

    //check if user (email/username) exists in db


    //create record of user in db
    let newUser = await User.create(username, email, passwordHash, []);
}