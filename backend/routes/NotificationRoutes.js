const express = require('express');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/NotificationController');
const AuthProtect = require('../middlewares/AuthProtect');
const roleMiddleware = require('../middlewares/roleMiddleware');

const adminOnly = roleMiddleware('admin');

const router = express.Router();

router.get('/', AuthProtect, getNotifications);
router.put('/:id/read', AuthProtect, markAsRead);
router.put('/mark-all-read', AuthProtect, markAllAsRead);

module.exports = router;