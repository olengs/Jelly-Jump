const userModel = require("../models/user-model");
const errors = require("../models/errors");

exports.friendslist = async(req,res) => { // looks at the User document and find the id in the bracker
    // const friendslist = req.session.user.friends || [] // [ { }, { }]
    // res.render('friends/friends',{friendslist,error:''})

    const search = req.query.search || '';
    const user = req.session && req.session.user ? req.session.user : null;
    
    const friendslist = await userModel.getFriendUsernamesForUser(req.session.user)
    let friendsIdlist = [];

    console.log('friendslist: ' + friendslist);
    for (const friend of friendslist) {
        const u = await userModel.getUserByName(friend);
        friendsIdlist.push({name: friend, id: u._id});
    }

    console.log(friendslist);
    console.log(friendsIdlist);

    if (search != '') {
        const topLimit = await userModel.getTopUsers(search, user._id, friendslist);

        return res.render('friends/friends', {friendslist, search, result: topLimit, error: '', friendsIdlist});
    };

    return res.render('friends/friends', {friendslist, search, result: [], error: "", friendsIdlist});
};

exports.addFriend = async (req,res) => {
    const friendName = req.body.friendName?.trim(); 
    const user = req.session.user;
    const search = req.query.search || '';
    
    const friendslist = await userModel.getFriendUsernamesForUser(user);
    let friendsIdlist = [];

    friendslist.forEach(async friend => {
        await friendsIdlist.push({friend: userModel.getUserByName(friend)._id});
    });

    if (!friendName) {    
        return res.render('friends/friends', {error:'friend name cannot be empty', friendslist, search, friendsIdlist});
    }; 

    if (friendName === user.username) {
        return res.render('friends/friends', {error:'cannot add yourself', friendslist, search, friendsIdlist});
    };
    
    try {
        const friend = await userModel.getUserByName(friendName); // if inside, it will show the obj. if not its null--> falsey 
        const isFriend = user.friends.some(id => id.toString() === friend._id.toString());
        
        if (isFriend)
            return res.render('friends/friends', {error:'already friends', friendslist, search, friendsIdlist});

        await userModel.addFriend(user._id, friendName);
        await userModel.addFriend(friend._id, user.username);
        return res.redirect('/friendslist');

    } catch (error) {
        if (error instanceof errors.UserNotFoundError) {
            console.log(error);
            return res.render('friends/friends', {error:'user not found', friendslist, search, friendsIdlist});
        };

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