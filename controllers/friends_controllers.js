const userModel = require("../models/user-model");
const errors = require("../models/errors");
const mongoose = require("mongoose");

exports.friendslist = async(req,res) => { // looks at the User document and find the id in the bracker
    // const friendslist = req.session.user.friends || [] // [ { }, { }]
    // res.render('friends/friends',{friendslist,error:''})
    const search = req.query.search || '';
    const user = req.session && req.session.user ? req.session.user : null;
    const friendslist = await userModel.getFriendUsernamesForUser(req.session.user)

    if (search != '') {
        const topLimit = await userModel.getTopUsers(search, user._id, friendslist);

        return res.render('friends/friends', {friendslist, search, result: topLimit, error: ''});
    };

    return res.render('friends/friends', {friendslist, search, result: [], error: ""});
};

exports.addFriend = async (req,res) => {
    const friendName = req.body.friendName?.trim(); 
    const user = req.session.user;
    const search = req.query.search || '';

    if (!friendName) {    
        return res.render('friends/friends', {error:'friend name cannot be empty', friendslist: await userModel.getFriendUsernamesForUser(user), search});
    }; 

    if (friendName === user.username) {
        return res.render('friends/friends', {error:'cannot add yourself', friendslist: await userModel.getFriendUsernamesForUser(user), search});
    };

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const friend = await userModel.getUserByName(friendName);
        // if inside, it will show the obj. if not its null--> falsey 
        const isFriend = user.friends.some(id => id.toString() === friend._id.toString());
        if (isFriend)
            return res.render('friends/friends', {error:'already friends', friendslist: await userModel.getFriendUsernamesForUser(user), search});

        await userModel.addFriend(user._id, friendName);
        await userModel.addFriend(friend._id, user.username);
        await session.commitTransaction();
        return res.redirect('/friendslist');
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof errors.UserNotFoundError) {
            console.log(error);
            return res.render('friends/friends', {error:'user not found', friendslist: await userModel.getFriendUsernamesForUser(user), search});
        };
        throw error;
    } finally {
        session.endSession();
    }
};

exports.deleteFriend = async(req,res) =>{
    const friendName = req.body.friendName?.trim(); 
    const friend = await userModel.getUserByName(friendName);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await userModel.deleteFriend(req.session.user._id, friendName);
        await userModel.deleteFriend(friend._id, req.session.user.username);
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    return res.redirect('/friendslist');
};


// for the addfriend. can use for each is can but need to do the isthere= false and isthere= true because foreach will loop through everything . EBERYTHING bfr it ends. thats why use .some can already

// await User.deleteOne({_id: friendid})	  deletes an entire user document
// $pull	                          deletes one element inside array