const {User} = require("../models/user-model") //import Friend from model


exports.friendslist = async(req,res) =>{
    try {

       const user = await User.findById(req.session.user._id) // looks at the User document and find the id in the bracker
       const friendslist = user.friends
       res.render('friends/friends',{friendslist})
}catch(error){
    console.log('cannot show ')
} }

exports.addFriend = async(req,res)=>{
    try{
        console.log('req.session.user:', req.session.user);
        if (!req.session.user) {
        return res.status(401).send('You are not logged in');
    }

        const friendname= req.body.friendname
         await User.findByIdAndUpdate(
            req.session.user._id,
{
    $push: {friends: {friendName:friendname}}
  } 

  
);

         res.redirect('/friendslist')
    } catch (error) {
        console.log(error)
        res.send('error cannot add')
    }
}

exports.deleteFriend = async(req,res) =>{
    try{
        const friendid= req.body.friendid
        await User.deleteOne({_id:friendid})
        res.redirect('friendslist')
    }catch(error){
        console.log(error)
        res.send('error cannot delete') }}


