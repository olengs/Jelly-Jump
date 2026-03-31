const userModel = require("../models/user-model");
const errors = require("../models/errors");


exports.friendslist = async(req,res) => { // looks at the User document and find the id in the bracker
    const friendslist = req.session.user.friends || [] // [ { }, { }]
    res.render('friends/friends',{friendslist,error:''})
}

exports.addFriend = async(req,res)=>{
    const friendName= req.body.friendName?.trim(); // what u key in 
    const userName= req.body.userName?.trim(); // what u key in

    if (!friendName || !userName){
        return res.render('friends/friends',{error:'both cannot be empty',friendslist});
    }
    if (userName===user.username){
        return res.render('friends/friends',{error:'cannot add yourself ',friendslist});
    }

    const friendslist = user.friends || []; // [ {friendname:----, username,---- }, { }]
    const isFriend = friendslist.some(friend => friend.username === userName);

    try {
        const userobj = await userModel.findUserByUsername(userName); // if inside, it will show the obj. if not its null--> falsey 
    } catch (error) {
        if (error instanceof errors.UserAlreadyExistsError) return res.render('friends/friends',{error:'not in database',friendslist});
        throw error;
    }

    if (isFriend){// already exist
        return res.render('friends/friends',{error:'this username already exists ',friendslist})
    }
    else{
        userModel.addFriend(req.session.user._id, friendName, userName)
            return res.redirect('/friendslist')
    }    
}

exports.deleteFriend = async(req,res) =>{
    try{
        const userName= req.body.userName
        await userModel.deleteFriend(req.session.user._id, userName)

        return res.redirect('/friendslist')
    }catch(error){
        console.log(error)
        res.send('error cannot delete') }}



// for the addfriend. can use for each is can but need to do the isthere= false and isthere= true because foreach will loop through everything . EBERYTHING bfr it ends. thats why use .some can already

// await User.deleteOne({_id: friendid})	  deletes an entire user document
// $pull	                          deletes one element inside array