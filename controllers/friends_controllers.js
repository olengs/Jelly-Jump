const userModel = require("../models/user-model");
const errors = require("../models/errors");


exports.friendslist = async(req,res) => { // looks at the User document and find the id in the bracker
    // const friendslist = req.session.user.friends || [] // [ { }, { }]
    // res.render('friends/friends',{friendslist,error:''})
    res.render('friends/friends', {friendslist: await userModel.getFriendUsernamesForUser(user), error: ""});
};

exports.addFriend = async (req,res) => {
    const friendName = req.body.friendName?.trim(); 
    const user = req.session.user;

    if (!friendName) {    
        return res.render('friends/friends', {error:'friend name cannot be empty', friendslist: await userModel.getFriendUsernamesForUser(user)});
    }; 

    if (friendName === req.session.user.username) {
        res.locals.error = "cannot add yourself";
        return res.render('friends/friends', {error:'cannot add yourself', friendslist: await userModel.getFriendUsernamesForUser(user)});
    };
    
    try {
        const friend = await userModel.getUserByName(friendName); // if inside, it will show the obj. if not its null--> falsey 
        const isFriend = friendIds.some(id => id.toString() === friend._id.toString());
        if (isFriend) {// already exist
            return res.render('friends/friends', {error:'already friends', friendslist: await userModel.getFriendUsernamesForUser(user)});
        } else {
            await userModel.addFriend(req.session.user._id, friendName);
            await userModel.addFriend(friend._id, user.username);
            return res.redirect('/friendslist');
        };   
    } catch (error) {         
        if (error instanceof errors.UserNotFoundError) {
            console.log(error);
            return res.render('friends/friends', {error:'user not found', friendslist: await userModel.getFriendUsernamesForUser(user)});
        }
        throw error;
    };
};

exports.deleteFriend = async(req,res) =>{
    const friendName = req.body.friendName?.trim(); 
    const friend = await userModel.getUserByName(friendName);

    await userModel.deleteFriend(req.session.user._id, friendName);
    await userModel.deleteFriend(friend._id, req.session.user.username);

    return res.redirect('/friendslist');
};


// for the addfriend. can use for each is can but need to do the isthere= false and isthere= true because foreach will loop through everything . EBERYTHING bfr it ends. thats why use .some can already

// await User.deleteOne({_id: friendid})	  deletes an entire user document
// $pull	                          deletes one element inside array