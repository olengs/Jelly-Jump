const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement_controller');
const authMiddleware = require('../middleware/user-middleware');

router.get('/', announcementController.getAnnouncements);
router.post('/createAnnouncement', authMiddleware.requireAdmin, announcementController.createAnnouncement);
router.post('/delete/:announcementId', authMiddleware.requireAdmin, announcementController.deleteAnnouncement);
router.post('/edit/:announcementId', authMiddleware.requireAdmin, announcementController.editAnnouncement);


module.exports = router;