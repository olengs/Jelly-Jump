const mongoose = require("mongoose");
const dbcommons = require("./dbcommons");
const errors = require("./errors");
const bcrypt = require("bcrypt");
const utilities = require("../utilities/utilities");

const email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //match {0-9A-z}1+, then @, then {0-9A-z}1+, then ., then {0-9A-z} 2+
const username_regex = /^[a-zA-Z0-9]{4,12}$/;
const password_regex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9\s])(?!.*\s).{8,}$/;

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique:true, trim:true},
    passwordHash: {type: String, required: true, unique:true},
    role: {type: String, required: true, enum: ["sysadmin", "admin", "player"], default:"player"},
    bio: {type: String, required: true, default: "My bio"},
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

const User = mongoose.model('User', userSchema, "users");
exports.User = User;

exports.createUser = async (username, email, password) => {
    if (!email.match(email_regex)){
        throw new errors.EmailFormatError();
    }
    if (!username.match(username_regex)) {
        throw new errors.UsernameFormatError();
    }

    if (!password.match(password_regex)) {
        throw new errors.PasswordFormatError();
    }

    if (!dbcommons.isDBConnected()) {
        throw dbcommons.databaseError;
    }

    const username_exists = User.findOne({username}).lean();
    const email_exists = User.findOne({email}).lean();

    if (await username_exists) {
        throw new errors.UserAlreadyExistsError(username);
    }

    if (await email_exists) {
        throw new errors.EmailAlreadyExistsError(email);
    }
    let passwordHash = await bcrypt.hash(password, Math.floor(Math.random() * 10));
    let dbuser = await User.create({username, email, passwordHash});

    if (!dbuser) {
        throw new Error("Failed to create user in db");
    }

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

exports.getAllUsers = async () => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    return await User.find({role: {$ne: "sysadmin"}}).lean() || [];
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
exports.deleteUser = async (id) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    await User.deleteOne({_id: id});
};

exports.addFriend = async (id, friendName, session = null) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    const friend = await User.findOne({username: friendName}).lean();

    if (!friend) throw new errors.UserNotFoundError(friendName);    

    if (session) return await User.updateOne({_id: id}, {$push: {friends: friend._id}}, {session});
    return await User.updateOne({_id: id}, {$push: {friends: friend._id}});

}

exports.deleteFriend = async (id, friendName, session = null) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    const friend = await User.findOne({username: friendName});
    if (!friend) throw new errors.UserNotFoundError(friendName);        

    if (session) return await User.findByIdAndUpdate(id, {$pull: {friends: friend._id}}, {session});
    return await User.findByIdAndUpdate(id, {$pull: {friends: friend._id}});
}

exports.getUsersByIds = async (ids) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    const users = await User.find({
        _id: { $in: ids }
    }).lean();

    return users || [];
}

exports.getFriendUsernamesForUser = async (user) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    if (!user) throw new Error("User is not found");
    const friends = (await this.getUsersByIds(user.friends)) || [];
    return friends.map(a => a.username);
}

exports.getTopUsers = async function(search, userId, friendslist) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    let results = await User.find({role: {$ne: "sysadmin"}}).lean();

    if (search) results = utilities.fuzzySearch(search.toLowerCase(), results, false, a => a.username.toLowerCase());
    
    // remove self from search and current friends from search
    return results.filter(user => user._id !== userId || friendslist.indexOf(user.username) === -1);
};

exports.checkAndCreateSysadminUser = async () => {
    console.log("checking for sysadmin");
    let user = await User.findOne({role: "sysadmin"});
    if (user) return;

    console.log(user, "creating sysadmin");
    user = await User.create({email: "sysadmin@jellyjump.com", passwordHash: await bcrypt.hash("JJAdmin@1", 10), username: "sysadmin", role: "sysadmin"});
    if (!user) throw new Error("Unable to create sysadmin");
}

exports.makeRole = async (userId, role) => {
    if (role == "player") {
        return await User.updateOne({_id: userId}, {role});
    } else if(role == "admin") {
        return await User.updateOne({_id: userId}, {role});
    }
    throw new Error("Invalid role to make");
}