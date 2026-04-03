const announcement = require('../models/announcement-model');
const User = require('../models/user-model');

exports.getAnnouncements = async (req, res) => {
    const announcements = await announcement.getAllAnnouncements();
    const scheduled = await announcement.getScheduledAnnouncements();
    const user = req.session.user || null;
    return res.render('announcement/announcement', {announcements, scheduled, user});
};

exports.createAnnouncement = async (req, res) => {
    const {title, message, urgency, datePosted} = req.body;
    const authorId = req.session.user._id;

    await announcement.createAnnouncement(authorId, title, message, urgency, datePosted);

    res.redirect('/announcement')
};

exports.deleteAnnouncement = async (req, res) => {
    const announcementId = req.params;
    await announcement.deleteAnnouncement(announcementId);

    res.redirect('/announcement');
};

exports.editAnnouncement = async (req, res) => {
    const {announcementId} = req.params;
    const {title, message, urgency, datePosted} = req.body;
    const updates = {};
    
    if (title) updates.title = title; 
    if (message) updates.message = message;
    if (urgency) updates.urgency = urgency;
    if (datePosted) updates.datePosted = new Date(datePosted);

    await announcement.updateAnnouncement(announcementId, updates);
    res.redirect('/announcement');
};