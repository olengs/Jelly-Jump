const mongoose = require("mongoose");
const User = require("./user-model");
const dbcommons = require("./dbcommons");
const utilities = require("../utilities/utilities");

const announcementSchema = new mongoose.Schema({
    authorId: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    title: {type: String, required: true, trim: true, maxlength: 100},
    message: {type: String, required: true, trim: true, maxlength: 1000},
    urgency: {type: String, enum: ['low', 'medium', 'high'], default: 'low', required: true},
    dateCreated: {type: Date, default: Date.now},
    lastUpdated: {type: Date, default: Date.now},
    // datePosted can be different from dateCreated
    datePosted: {type: Date, default: Date.now}
});

const Announcements = mongoose.model('Announcement', announcementSchema);

exports.createAnnouncement = async function(authorId, title, message, urgency, datePosted = Date.now()) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    
    const newAnnouncement = await Announcements.create({authorId, title, message, urgency, datePosted: datePosted ? new Date(datePosted) : new Date()});
    
    return newAnnouncement
};

exports.getScheduledAnnouncements = function() {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return Announcements.find({ datePosted: { $gt: new Date() } }).sort({datePosted: 1}); // soonest first
};

exports.getAllAnnouncements = function() {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    // $lte -> less than or equal to, ensures only announcements with datePosted in the past are shown
    return Announcements.find({ datePosted: { $lte: new Date()}}).sort({datePosted: -1});
};

exports.deleteAnnouncement = function(announcementId) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    console.log("myannouncment", announcementId);
    return Announcements.deleteOne({_id: announcementId});
};

exports.updateAnnouncement = function(announcementId, updates) {
    if (!dbcommons.isDBConnected()) throw dbcommons.databaseError;
    return Announcements.updateOne({_id: announcementId}, {...updates, lastUpdated: new Date()});
};