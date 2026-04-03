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
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    friendRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    loginAttempts: {type: Number, default: 0}, 
    lockUntil: {type: Date, default: null}, 
    securityAnswer: {type: String, required: true},
});

const User = mongoose.model('User', userSchema, "users");
exports.User = User;

exports.createUser = async (username, email, password, securityAnswer) => {
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
    let dbuser = await User.create({username, email, passwordHash, securityAnswer});

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

exports.sendFriendRequest = async (senderId, friendName) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    const friend = await User.findOne({username: friendName}).lean();
    if (!friend) throw new errors.UserNotFoundError(friendName);

    return await User.findByIdAndUpdate(friend._id, {
        $addToSet: {friendRequests: senderId}
    });
};

exports.acceptFriendRequest = async (userId, requesterName) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    const requester = await User.findOne({username: requesterName}).lean();
    if (!requester) throw new errors.UserNotFoundError(requesterName);

    await dbcommons.runInTransaction(async () => {
        await User.findByIdAndUpdate(userId, {
            $addToSet: {friends: requester._id},
            $pull: {friendRequests: requester._id}
        });
        await User.findByIdAndUpdate(requester._id, {
            $addToSet: {friends: userId}
        });
    });
};

exports.rejectFriendRequest = async (userId, requesterName) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    const requester = await User.findOne({username: requesterName}).lean();
    if (!requester) throw new errors.UserNotFoundError(requesterName);

    return await User.findByIdAndUpdate(userId, {
        $pull: {friendRequests: requester._id}
    });
};

exports.getSentRequestUsernames = async (userId) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    const usersWithRequest = await User.find({friendRequests: userId}).lean();
    return usersWithRequest.map(u => u.username);
};

exports.getPendingRequestUsernames = async (user) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    const requestIds = user.friendRequests || [];
    if (requestIds.length === 0) return [];
    const requesters = await User.find({_id: {$in: requestIds}}).lean();
    return requesters.map(u => u.username);
};

exports.deleteFriend = async (id, friendName) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    const friend = await User.findOne({username: friendName});
    if (!friend) throw new errors.UserNotFoundError(friendName);        

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
    const friends = (await exports.getUsersByIds(user.friends)) || [];
    return friends.map(a => a.username);
}

exports.getFriendUsernamesAndIdsForUser = async (user) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    if (!user) throw new Error("User is not found");
    const friends = (await exports.getUsersByIds(user.friends)) || [];
    return friends.map(a => {
        return {name: a.username, id: a._id}
    });
}

exports.getTopUsers = async function(search, userId, friendslist) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    let results = await User.find({role: {$ne: "sysadmin"}}).lean();

    if (search) results = utilities.fuzzySearch(search.toLowerCase(), results, false, a => a.username.toLowerCase());
    
    // remove self from search and current friends from search -> cannot combine -> will cause ERROR
    results = results.filter(user => user._id.toString() !== userId.toString());
    results = results.filter(user => friendslist.indexOf(user.username) === -1);

    return results
};

// lock account after 3 failed login attempts 
exports.incrementLoginAttempts = async (username) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;

    await dbcommons.runInTransaction(async () => {
        let user = await User.findOneAndUpdate({username}, { $inc: { loginAttempts: 1 } }, {new: true}).lean();
        if (user && user.loginAttempts >= 3) {
            await User.updateOne({username}, { lockUntil: new Date(Date.now() + 30 * 1000) });
        }
    });
}

// unlock account 
exports.resetLoginAttempts = async (username) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return await User.updateOne({username}, {loginAttempts: 0, lockUntil: null});
}

exports.isLocked = async (username) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    let user = await User.findOne({username});
    if (!user) return false; 
    if (user.lockUntil && user.lockUntil > Date.now()){
        return true; 
    } 
    if (user.lockUntil && user.lockUntil <= Date.now()){
        await User.updateOne({username}, {loginAttempts: 0, lockUntil: null});
    }
    return false;
}

exports.verifySecurityAnswer = async (username, answer) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError; 
    let user = await User.findOne({username});
    if (!user) throw new errors.UserNotFoundError(username);
    return user.securityAnswer.toLowerCase() === answer.toLowerCase();
}

exports.resetPassword = async (username, newPassword) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    if (!newPassword.match(password_regex)) throw new errors.PasswordFormatError();
    let newPasswordHash = await bcrypt.hash(newPassword, Math.floor(Math.random() * 10));
    return await User.updateOne({username}, {passwordHash: newPasswordHash});
}

exports.updateUser = async (id, username, bio) => {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    let username_exists = User.findOne({username, _id: {$ne: id}}).lean();
    if (await username_exists) throw new errors.UserAlreadyExistsError();
    if (!username.match(username_regex)) throw new errors.UsernameFormatError();
    return await User.findByIdAndUpdate(id, {username, bio}, {new: true});
}

exports.checkAndCreateSysadminUser = async () => {
    //console.log("checking for sysadmin");
    let user = await User.findOne({role: "sysadmin"});
    if (user) return;

    //console.log(user, "creating sysadmin");
    user = await User.create({email: "sysadmin@jellyjump.com", passwordHash: await bcrypt.hash("JJAdmin@1", 10), username: "sysadmin", role: "sysadmin", securityAnswer: "sysadmin"});
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
