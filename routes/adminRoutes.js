const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Player = require('../models/Player');

// Middleware: check if user is admin
function isAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.isAdmin) {
        return next();
    }
    return res.status(403).send('Access denied. Admins only.');
}

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────

// GET /admin — Admin dashboard
router.get('/', isAdmin, async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ datePosted: -1 });
        const players = await Player.find().sort({ username: 1 });
        res.render('admin/dashboard', { announcements, players });
    } catch (err) {
        res.status(500).render('error', { message: 'Failed to load admin dashboard', error: err });
    }
});

// ─── ANNOUNCEMENTS CRUD ──────────────────────────────────────────────────────

// GET /admin/announcements/new — Show create form
router.get('/announcements/new', isAdmin, (req, res) => {
    res.render('admin/announcement-form', { announcement: null, errors: [] });
});

// POST /admin/announcements — Create new announcement
router.post('/announcements', isAdmin, async (req, res) => {
    const { title, message, urgency } = req.body;
    const errors = [];

    if (!title || title.trim() === '') errors.push('Title is required.');
    if (!message || message.trim() === '') errors.push('Message is required.');
    if (!['low', 'medium', 'high'].includes(urgency)) errors.push('Invalid urgency level.');

    if (errors.length > 0) {
        return res.render('admin/announcement-form', {
            announcement: { title, message, urgency },
            errors
        });
    }

    try {
        await Announcement.create({ title: title.trim(), message: message.trim(), urgency });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).render('error', { message: 'Failed to create announcement', error: err });
    }
});

// GET /admin/announcements/:id/edit — Show edit form
router.get('/announcements/:id/edit', isAdmin, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).render('error', { message: 'Announcement not found' });
        res.render('admin/announcement-form', { announcement, errors: [] });
    } catch (err) {
        res.status(500).render('error', { message: 'Failed to load announcement', error: err });
    }
});

// POST /admin/announcements/:id/edit — Update announcement
router.post('/announcements/:id/edit', isAdmin, async (req, res) => {
    const { title, message, urgency } = req.body;
    const errors = [];

    if (!title || title.trim() === '') errors.push('Title is required.');
    if (!message || message.trim() === '') errors.push('Message is required.');
    if (!['low', 'medium', 'high'].includes(urgency)) errors.push('Invalid urgency level.');

    if (errors.length > 0) {
        return res.render('admin/announcement-form', {
            announcement: { _id: req.params.id, title, message, urgency },
            errors
        });
    }

    try {
        await Announcement.findByIdAndUpdate(req.params.id, {
            title: title.trim(),
            message: message.trim(),
            urgency,
            datePosted: Date.now()
        });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).render('error', { message: 'Failed to update announcement', error: err });
    }
});

// POST /admin/announcements/:id/delete — Delete announcement
router.post('/announcements/:id/delete', isAdmin, async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).render('error', { message: 'Failed to delete announcement', error: err });
    }
});

// ─── PLAYER HISTORY CRUD ─────────────────────────────────────────────────────

// GET /admin/players/:id — View player + game history
router.get('/players/:id', isAdmin, async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).render('error', { message: 'Player not found' });
        res.render('admin/player-detail', { player, errors: [] });
    } catch (err) {
        res.status(500).render('error', { message: 'Failed to load player', error: err });
    }
});

// POST /admin/players/:id/history/:entryId/edit — Edit a single game history entry
router.post('/players/:id/history/:entryId/edit', isAdmin, async (req, res) => {
    const { score, level, duration } = req.body;
    const errors = [];

    if (isNaN(score) || score < 0) errors.push('Score must be a non-negative number.');
    if (isNaN(level) || level < 1) errors.push('Level must be at least 1.');
    if (isNaN(duration) || duration < 0) errors.push('Duration must be a non-negative number.');

    if (errors.length > 0) {
        const player = await Player.findById(req.params.id);
        return res.render('admin/player-detail', { player, errors });
    }

    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).render('error', { message: 'Player not found' });

        const entry = player.gameHistory.id(req.params.entryId);
        if (!entry) return res.status(404).render('error', { message: 'History entry not found' });

        entry.score = Number(score);
        entry.level = Number(level);
        entry.duration = Number(duration);

        // Recalculate highScore
        player.highScore = Math.max(...player.gameHistory.map(h => h.score), 0);

        await player.save();
        res.redirect(`/admin/players/${req.params.id}`);
    } catch (err) {
        res.status(500).render('error', { message: 'Failed to update history entry', error: err });
    }
});

// POST /admin/players/:id/history/:entryId/delete — Delete a game history entry
router.post('/players/:id/history/:entryId/delete', isAdmin, async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).render('error', { message: 'Player not found' });

        player.gameHistory = player.gameHistory.filter(
            h => h._id.toString() !== req.params.entryId
        );

        player.totalGamesPlayed = player.gameHistory.length;
        player.highScore = player.gameHistory.length > 0
            ? Math.max(...player.gameHistory.map(h => h.score))
            : 0;

        await player.save();
        res.redirect(`/admin/players/${req.params.id}`);
    } catch (err) {
        res.status(500).render('error', { message: 'Failed to delete history entry', error: err });
    }
});

module.exports = router;
