const userModel = require("../models/user-model");
const errors = require("../models/errors");


exports.friendslist = async(req,res) => { // looks at the User document and find the id in the bracker
    try {
        // const friendslist = req.session.user.friends || [] // [ { }, { }]
        // res.render('friends/friends',{friendslist,error:''})

        const user = await userModel.User.findById(req.session.user._id).lean();
        const friendIds = user.friends; 
        let friendslist = [];
        
        for (let friendId of friendIds) {
            let friend = await userModel.User.findById(friendId).lean();
            friendslist.push(friend);
        };

        res.render('friends/friends', {friendslist, error:''});
    } catch (error) {
        if (error instanceof errors.CannotGetFriendsListError) return res.render('friends/friends',{error:'cannot get friends list',friendslist});
        throw error;
    };
};

exports.addFriend = async(req,res)=>{
    const friendName= req.body.friendName?.trim(); 

    if (!friendName) {
        return res.render('friends/friends',{error:'why empty cannot be empty', friendslist: []});
    }; 

    if (friendName === req.session.user.username) {
        return res.render('friends/friends', {error:'cannot add yourself', friendslist: []});
    };
    
    const user = await userModel.User.findById(req.session.user._id).lean();
    const friendslist = user.friends || []; // [ {friendname:----, username,---- }, { }]
    
    try {
        const friend = await userModel.findUserByUsername(friendName); // if inside, it will show the obj. if not its null--> falsey 
        const isFriend = friendslist.some(id => id.toString() === friend._id.toString());
        if (isFriend){// already exist
            return res.render('friends/friends',{error:'already friends',friendslist})
        } else {
            await userModel.addFriend(req.session.user._id, friendName);
            await userModel.addFriend(friend._id, user.username);

            return res.redirect('/friendslist')
        };   
    } catch (error) { 
        let name_friendslist = [];
        
        for (let friendId of friendslist) {
            let f = await userModel.User.findById(friendId).lean();
            name_friendslist.push(f.username);
        };
        
        console.log('FRIENDSLIST: ', name_friendslist)
        if (error instanceof errors.UserNotFoundError) return res.render('friends/friends', {error:'user not found', friendslist: name_friendslist});
        throw error;
    };
};

exports.deleteFriend = async(req,res) =>{
    try {
        const user = await userModel.User.findById(req.session.user._id).lean();
        const friendName = req.body.friendName?.trim(); 
        const friend = await userModel.findUserByUsername(friendName);

        await userModel.deleteFriend(req.session.user._id, friendName);
        await userModel.deleteFriend(friend._id, user.username);

        return res.redirect('/friendslist');
    } catch(error) {
        console.log(error)
        res.send('error: cannot delete') 
    }
};


// for the addfriend. can use for each is can but need to do the isthere= false and isthere= true because foreach will loop through everything . EBERYTHING bfr it ends. thats why use .some can already

// await User.deleteOne({_id: friendid})	  deletes an entire user document
// $pull	                          deletes one element inside array