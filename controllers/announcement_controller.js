const announcement = require('../models/announcement-model');
const User = require('../models/user-model');

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await announcement.getAllAnnouncements();
        const user = req.session.user || null;
        return res.render('announcement/announcement', {announcements, user})
    } catch (error) {
        console.log(error);
        res.status(500).render('error', {error: error.message, statusCode: 500});
    };
};

exports.createAnnouncement = async (req, res) => {
    try {
        const {title, message, urgency, datePosted} = req.body;
        const authorId = req.session.user._id;

        await announcement.createAnnouncement(authorId, title, message, urgency, datePosted);

        res.redirect('/announcement')
    } catch (error) {
        console.log(error);
        res.status(500).render('error', {error: error.message, statusCode: 500});
    };
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcementId = req.params;
        await announcement.deleteAnnouncement(announcementId);

        res.redirect('/announcement');
    } catch (error) {
        console.log(error);
        res.status(500).render('error', {error: error.message, statusCode: 500});
    }
};

exports.editAnnouncement = async (req, res) => {
    try {
        const {announcementId} = req.params;
        const {title, message, urgency, datePosted} = req.body;
        const updates = {};
        
        if (title) {
            updates.title = title;
        } 

        if (message) {
            updates.message = message;
        }

        if (urgency) {
            updates.urgency = urgency;
        }

        if (datePosted) {
            updates.datePosted = new Date(datePosted);
        } 

        await announcement.updateAnnouncement(announcementId, updates);
        res.redirect('/announcement');
    } catch (error) {
        console.log(error);
        res.status(500).render('error', {error: error.message, statusCode: 500});
    }
};