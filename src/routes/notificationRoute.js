const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/** @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Gửi thông báo
 *     security: [{bearerAuth: []}]
 *     responses: {201: {description: Gửi thành công}}
 */
router.post('/', authenticateToken, authorize(['admin', 'staff']), notificationController.sendNotification);

/** @swagger
 * /api/notifications/sent/list:
 *   get:
 *     tags: [Notifications]
 *     summary: Danh sách đã gửi
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách}}
 */
router.get('/sent/list', authenticateToken, authorize(['admin', 'staff']), notificationController.listSentNotifications);

/** @swagger
 * /api/notifications/my/list:
 *   get:
 *     tags: [Notifications]
 *     summary: Thông báo của tôi
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách thông báo}}
 */
router.get('/my/list', authenticateToken, notificationController.getTenantNotifications);

/** @swagger
 * /api/notifications/unread/count:
 *   get:
 *     tags: [Notifications]
 *     summary: Số thông báo chưa đọc
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Số lượng}}
 */
router.get('/unread/count', authenticateToken, notificationController.getUnreadNotificationCount);

/** @swagger
 * /api/notifications/{notificationId}:
 *   get:
 *     tags: [Notifications]
 *     summary: Chi tiết thông báo
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: notificationId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Chi tiết}}
 */
router.get('/:notificationId', authenticateToken, notificationController.getNotificationDetails);

/** @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Đánh dấu đã đọc
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: notificationId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Đánh dấu thành công}}
 */
router.put('/:notificationId/read', authenticateToken, notificationController.markAsRead);

/** @swagger
 * /api/notifications/my/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Đánh dấu tất cả đã đọc
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Đánh dấu thành công}}
 */
router.put('/my/read-all', authenticateToken, notificationController.markAllAsRead);

/** @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Xóa thông báo
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: notificationId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Xóa thành công}}
 */
router.delete('/:notificationId', authenticateToken, notificationController.deleteNotification);

module.exports = router;
