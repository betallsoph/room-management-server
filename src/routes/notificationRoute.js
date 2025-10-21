const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// [Admin] Tạo & gửi thông báo
router.post('/', authenticateToken, authorize(['admin', 'staff']), notificationController.sendNotification);

// [Admin] Xem danh sách thông báo đã gửi
router.get('/sent/list', authenticateToken, authorize(['admin', 'staff']), notificationController.listSentNotifications);

// [Tenant] Xem thông báo của mình - PHẢI ĐẶT TRƯỚC /:notificationId
router.get('/my/list', authenticateToken, notificationController.getTenantNotifications);

// [User] Xem số thông báo chưa đọc - PHẢI ĐẶT TRƯỚC /:notificationId
router.get('/unread/count', authenticateToken, notificationController.getUnreadNotificationCount);

// [Tenant] Xem thông báo chi tiết
router.get('/:notificationId', authenticateToken, notificationController.getNotificationDetails);

// [Tenant] Đánh dấu thông báo là đã đọc
router.put('/:notificationId/read', authenticateToken, notificationController.markAsRead);

// [Tenant] Đánh dấu tất cả thông báo là đã đọc
router.put('/my/read-all', authenticateToken, notificationController.markAllAsRead);

// [Tenant] Xóa thông báo
router.delete('/:notificationId', authenticateToken, notificationController.deleteNotification);

module.exports = router;
