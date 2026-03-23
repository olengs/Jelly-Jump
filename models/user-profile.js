// 6 fields: username, email, password, avatar (url string for pfp), bio 

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {type: String, required: true}, 
    email: {type: String, required: true}, 
    password: {type: String, required: true},
    nickname: {type: String, default: ""}, 
    bio: {type: String, default: ""}
}); 

module.exports = mongoose.model("User", userSchema); 