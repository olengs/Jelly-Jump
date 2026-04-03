const userModel = require("../models/user-model");
const errors = require("../models/errors");

async function buildFriendsPageData(user, search = '') {
    const friendslist = await userModel.getFriendUsernamesForUser(user);
    const friendsIdlist = [];
    for (const fname of friendslist) {
        const u = await userModel.getUserByName(fname);
        friendsIdlist.push({name: fname, id: u._id});
    }

    const freshUser = await userModel.getUserById(user._id);
    const incomingRequests = await userModel.getPendingRequestUsernames(freshUser);
    const sentRequests = await userModel.getSentRequestUsernames(user._id);

    let result = [];
    if (search !== '') {
        result = await userModel.getTopUsers(search, user._id, friendslist);
        result = result.filter(r => !incomingRequests.includes(r.username));
    }

    return {friendslist, friendsIdlist, incomingRequests, sentRequests, result, search};
};

exports.friendslist = async(req,res) => { // looks at the User document and find the id in the bracker
    const search = req.query.search || '';
    const user = req.session && req.session.user ? req.session.user : null;

    const friendslist = await userModel.getFriendUsernamesForUser(req.session.user);
    let friendsIdlist = [];
    
    for (const fname of friendslist) {
        const u = await userModel.getUserByName(fname);
        friendsIdlist.push({name: fname, id: u._id});
    }

    const incomingRequests = await userModel.getPendingRequestUsernames(await userModel.getUserById(user._id));

    if (search != '') {
        const topLimit = await userModel.getTopUsers(search, user._id, friendslist);
        const sentRequests = await userModel.getSentRequestUsernames(user._id);

        const error = topLimit.length > 0 ? '' : 'No search result!'

        return res.render('friends/friends', {friendslist, friendsIdlist, search, result: topLimit, error, incomingRequests, sentRequests});
    };

    return res.render('friends/friends', {friendslist, friendsIdlist, incomingRequests,sentRequests: [], result: [], search: '', error: ''});
};

exports.addFriend = async (req,res) => {
    const friendName = req.body.friendName?.trim(); 
    const user = req.session.user;
    const search = req.query.search || '';
    const data = await buildFriendsPageData(user, search);

    if (!friendName) {
        return res.render('friends/friends', {...data,error:'friend name cannot be empty', friendslist: await userModel.getFriendUsernamesForUser(user)});
    }; 

    if (friendName === user.username) {
        return res.render('friends/friends', {...data,error:'cannot add yourself', friendslist: await userModel.getFriendUsernamesForUser(user)});
    };
    
    try {
        const friend = await userModel.getUserByName(friendName); // if inside, it will show the obj. if not its null--> falsey 
        const isFriend = user.friends.some(id => id.toString() === friend._id.toString());
        
        if (isFriend) {// already exist
            return res.render('friends/friends', {...data, error:'already friends', friendslist: await userModel.getFriendUsernamesForUser(user)});
        };

        const sentRequests = await userModel.getSentRequestUsernames(user._id);
        if (sentRequests.includes(friendName)) {
            const data = await buildFriendsPageData(user, search);
            return res.render('friends/friends', {...data, error: 'Friend request already sent'});
        }

        await userModel.sendFriendRequest(user._id, friendName);
        return res.redirect('/friendslist');
        // await userModel.addFriend(user._id, friendName);
        // await userModel.addFriend(friend._id, user.username);
        // return res.redirect('/friendslist');
        
    } catch (error) {
        if (error instanceof errors.UserNotFoundError) {
            console.log(error);
            return res.render('friends/friends', {...data, error:'user not found', friendslist: await userModel.getFriendUsernamesForUser(user), search});
        }
        throw error;
    };
};

exports.acceptFriend = async (req, res) => {
    try {
        const requesterName = req.body.requesterName?.trim();
        const user = req.session.user;
        await userModel.acceptFriendRequest(user._id, requesterName);
        const updatedUser = await userModel.getUserById(user._id);
        req.session.user = updatedUser;
        return res.redirect('/friendslist');
    } catch (error) {
        console.log(error);
        return res.redirect('/friendslist');
    }
};

exports.rejectFriend = async (req, res) => {
    try {
        const requesterName = req.body.requesterName?.trim();
        const user = req.session.user;
        await userModel.rejectFriendRequest(user._id, requesterName);
        const updatedUser = await userModel.getUserById(user._id);
        req.session.user = updatedUser;
        return res.redirect('/friendslist');
    } catch (error) {
        console.log(error);
        return res.redirect('/friendslist');
    }
};


exports.deleteFriend = async(req,res) =>{
    const friendName = req.body.friendName?.trim(); 
    const friend = await userModel.getUserByName(friendName);

    await userModel.deleteFriend(req.session.user._id, friendName);
    await userModel.deleteFriend(friend._id, req.session.user.username);

    return res.redirect('/friendslist');
};

exports.whatsProfile = async(req,res)=>{
    let idArray=[]
    const friendslist=  await userModel.getFriendUsernamesForUser(req.session.user) // [ben,mary ]
    for ( let aname of friendslist){
        const new1= await userModel.getUserByName(aname)// entire user
        idArray.push(new1._id)

    }
    res.render('friends/friends',{idArray, error:'',friendslist})
    
}


// for the addfriend. can use for each is can but need to do the isthere= false and isthere= true because foreach will loop through everything . EBERYTHING bfr it ends. thats why use .some can already

// await User.deleteOne({_id: friendid})	  deletes an entire user document
// $pull	                          deletes one element inside array