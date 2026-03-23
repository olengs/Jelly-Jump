const mongoose = require("mongoose");
const errors = require("./errors");

exports.isDBConnected = () =>  {
    return mongoose.STATES[mongoose.connection.readyState] == "connected";
}

exports.databaseError = new errors.DatabaseNotConnectedError();