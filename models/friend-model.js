
const mongoose = require("mongoose");// talk to MongoDB

const friendSchema = new mongoose.Schema({ // schema --> plan of how ur data look like 
    user: { type: String, required: true },      // current user
    friendName: { type: String, required: true } // friend "user": "Brilynn",
});

const Friend = mongoose.model("Friend", friendSchema, "friends");
//                            model        Schema        table in Mongo      
//Friend lets your code create, read, update, delete data in the friends collection 
// eg. await Friend.create(),Friend.find(), Friend.deleteone, Friend.updateone()


module.exports = Friend;

// Schema = “form template”
// Model = “tool to create/read/delete forms”
// MongoDB = “storage”

