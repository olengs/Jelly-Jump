const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
        required: [true, 'Urgency level is required']
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    datePosted: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', announcementSchema);
