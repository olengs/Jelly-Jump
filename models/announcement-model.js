const mongoose = require("mongoose");
const User = require("./user-model");
const dbcommons = require("./dbcommons");
const utilities = require("../utilities/utilities");

const announcementSchema = new mongoose.Schema({
    authorId: {type: String, required: true, unique: true},
    title: {type: String, required: true, trim: true, maxlength: 100},
    message: {type: String, required: true, trim: true, maxlength: 1000},
    urgency: {type: String, enum: ['low', 'medium', 'high'], default: 'low', required: true},
    dateCreated: {type: Date, default: Date.now},
    // datePosted can be different from dateCreated
    datePosted: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Announcement', announcementSchema);