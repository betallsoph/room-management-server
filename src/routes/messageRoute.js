const express = require('express');
const messageController = require('../controllers/messageController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/** @swagger
 * /api/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Gửi tin nhắn
 *     security: [{bearerAuth: []}]
 *     responses: {201: {description: Gửi thành công}}
 */
router.post('/', authenticateToken, messageController.sendMessage);

/** @swagger
 * /api/messages/my/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Danh sách cuộc trò chuyện
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách}}
 */
router.get('/my/conversations', authenticateToken, messageController.listConversations);

/** @swagger
 * /api/messages/unread/count:
 *   get:
 *     tags: [Messages]
 *     summary: Số tin nhắn chưa đọc
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Số lượng}}
 */
router.get('/unread/count', authenticateToken, messageController.getUnreadMessageCount);

/** @swagger
 * /api/messages/conversation/{conversationId}:
 *   get:
 *     tags: [Messages]
 *     summary: Lịch sử trò chuyện
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: conversationId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Lịch sử}}
 */
router.get('/conversation/:conversationId', authenticateToken, messageController.getConversationHistory);

/** @swagger
 * /api/messages/admin/all-messages:
 *   get:
 *     tags: [Messages]
 *     summary: Admin xem tất cả tin nhắn
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách}}
 */
router.get('/admin/all-messages', authenticateToken, authorize(['admin', 'staff']), messageController.adminViewAllMessages);

/** @swagger
 * /api/messages/{messageId}:
 *   get:
 *     tags: [Messages]
 *     summary: Chi tiết tin nhắn
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: messageId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Chi tiết}}
 */
router.get('/:messageId', authenticateToken, messageController.getMessageDetails);

/** @swagger
 * /api/messages/{messageId}:
 *   put:
 *     tags: [Messages]
 *     summary: Chỉnh sửa tin nhắn
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: messageId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Sửa thành công}}
 */
router.put('/:messageId', authenticateToken, messageController.editMessage);

/** @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     tags: [Messages]
 *     summary: Xóa tin nhắn
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: messageId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Xóa thành công}}
 */
router.delete('/:messageId', authenticateToken, messageController.deleteMessage);

/** @swagger
 * /api/messages/{messageId}/attachment:
 *   post:
 *     tags: [Messages]
 *     summary: Gửi file đính kèm
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: messageId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Upload thành công}}
 */
router.post('/:messageId/attachment', authenticateToken, messageController.uploadAttachment);

module.exports = router;
