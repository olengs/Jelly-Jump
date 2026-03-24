const Friend = require("../models/friend-model") //import Friend from model


exports.friendslist = async(req,res) =>{
    try {
        
        const AllDataFriends= await Friend.find() // get all data from MongoDB
        res.render("friends/friends",{AllDataFriends})

    }catch (error) {
        console.log(error);
        res.send("Error loading friends");
    }
}

exports.addFriend = async(req,res)=>{
    try{
         const {friendname, frienduser} = req.body
         await Friend.create({user:friendname,
                            friendName: frienduser
                            }) // add to mongodb
         res.redirect('friendslist')
    } catch (error) {
        console.log(error)
        res.send('error cannot add')
    }
}

exports.deleteFriend = async(req,res) =>{
    try{
        const friendid= req.body.friendid
        await Friend.deleteOne({_id:friendid})
        res.redirect('friendslist')
    }catch(error){
        console.log(error)
        res.send('error cannot delete') }}


