const userModel = require("../models/user-model") //import Friend from model


exports.friendslist = async(req,res) =>{
    try {

       const user = await userModel.getUserById(req.session.user._id) // looks at the User document and find the id in the bracker
       const friendslist = user.friends || [] // [ { }, { }]
       res.render('friends/friends',{friendslist,error:''})
}catch(error){
    console.log('cannot show ')
} }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.addFriend = async(req,res)=>{
    try{
        console.log('req.session.user:', req.session.user);
        if (!req.session.user) {
        return res.status(401).send('You are not logged in');
    }

        const friendName= req.body.friendName?.trim() // what u key in 
        const userName= req.body.userName?.trim() // what u key in

        const user = await userModel.getUserById(req.session.user._id) // looks at the User document and find the id in the bracker
        const friendslist = user.friends || [] // [ {friendname:----, username,---- }, { }]
        
        const isFriend = friendslist.some(friend=>friend.username ===userName )
        const userobj= await userModel.findUserByUsername(userName) // if inside, it will show the obj. if not its null--> falsey 

        if (!friendName || !userName){
            return res.render('friends/friends',{error:'both cannot be empty',friendslist})
        }
        if (!userobj){ // if its not oin database
            return res.render('friends/friends',{error:'not in database',friendslist})

        }
        if (userName===user.username){
            return res.render('friends/friends',{error:'cannot add yourself ',friendslist})
        }
        if (isFriend){// already exist
            return res.render('friends/friends',{error:'this username already exists ',friendslist})

        }
        
        await userModel.addFriend(req.session.user._id, friendName, userName,userobj._id)
        return res.redirect('/friendslist')
        
        

         
    } catch (error) {
        console.log(error)
        res.send('error cannot add')
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