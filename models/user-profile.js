// 6 fields: username, email, password, avatar (url string for pfp), bio 

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {type: String, required: true}, 
    email: {type: String, required: true}, 
    password: {type: String, required: true},
    nickname: {type: String, default: ""}, 
    bio: {type: String, default: ""}
}); 

const User = mongoose.model("User", userSchema);

module.exports = User; 

// get user by id
module.exports.getUserById = async (userID) => {
    return await User.findById(userID);
};

// update user 
module.exports.updateUser = async (userID, updatedData) => {
    return await User.findByIdAndUpdate(userID, updatedData, {new: true});
};

// delete
module.exports.deleteUser = async (userID) => {
    await User.findByIdAndDelete(userID);
};