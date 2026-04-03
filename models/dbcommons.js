const mongoose = require("mongoose");
const errors = require("./errors");

exports.isDBConnected = () =>  {
    return mongoose.STATES[mongoose.connection.readyState] == "connected";
}

exports.databaseError = new errors.DatabaseNotConnectedError();

exports.runInTransaction = (func) => {
    if (!this.isDBConnected()) throw this.databaseError;

    return mongoose.connection.transaction(async () => await func());
}