const {User} = require("../models/user-model") //import Friend from model


exports.friendslist = async(req,res) =>{
    try {

       const user = await User.findById(req.session.user._id) // looks at the User document and find the id in the bracker
       const friendslist = user.friends || [] // [ { }, { }]
       res.render('friends/friends',{friendslist,error:''},)
}catch(error){
    console.log('cannot show ')
} }

exports.addFriend = async(req,res)=>{
    try{

        console.log('req.session.user:', req.session.user);
        if (!req.session.user) {
        return res.status(401).send('You are not logged in');
    }

        const friendname= req.body.friendname // what u key in 
        const user = await User.findById(req.session.user._id) // looks at the User document and find the id in the bracker
        const friendslist = user.friends // [ { }, { }]
        
        const isFriend = friendslist.some(friend => friendname === friend.friendName) // true or false 

        if (isFriend === false){ // not inside
            
            await User.findByIdAndUpdate(
            req.session.user._id,
                {
                    $push: {friends: {friendName:friendname}}
                } )
            return res.redirect('/friendslist') // redirect cz if not friendslist is not the updated one
            }
        else { // inside
            
            return res.render('friends/friends',{error:'already exist',friendslist})
        }

        
         
    } catch (error) {
        console.log(error)
        res.send('error cannot add')
    }
}

exports.deleteFriend = async(req,res) =>{
    try{
        const friendname= req.body.friendname
        await User.findByIdAndUpdate(
            req.session.user._id ,// which user document 
            {
                $pull:{friends:{friendName:friendname}}
            }
        )
        res.redirect('/friendslist')
    }catch(error){
        console.log(error)
        res.send('error cannot delete') }}



// for the addfriend. can use for each is can but need to do the isthere= false and isthere= true because foreach will loop through everything . EBERYTHING bfr it ends. thats why use .some can already

// await User.deleteOne({_id: friendid})	  deletes an entire user document
// $pull	                          deletes one element inside array