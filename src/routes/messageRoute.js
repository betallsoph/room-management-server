const express = require('express');
const messageController = require('../controllers/messageController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// [Tenant/Admin] Gửi tin nhắn
router.post('/', authenticateToken, messageController.sendMessage);

// [Tenant/Admin] Danh sách conversations - PHẢI ĐẶT TRƯỚC /:messageId
router.get('/my/conversations', authenticateToken, messageController.listConversations);

// [Tenant/Admin] Xem số tin nhắn chưa đọc - PHẢI ĐẶT TRƯỚC /:messageId
router.get('/unread/count', authenticateToken, messageController.getUnreadMessageCount);

// [Tenant/Admin] Xem đoạn chat - PHẢI ĐẶT TRƯỚC /:messageId
router.get('/conversation/:conversationId', authenticateToken, messageController.getConversationHistory);

// [Admin] Xem tất cả đoạn chat - PHẢI ĐẶT TRƯỚC /:messageId
router.get('/admin/all-messages', authenticateToken, authorize(['admin', 'staff']), messageController.adminViewAllMessages);

// [Tenant/Admin] Chi tiết tin nhắn
router.get('/:messageId', authenticateToken, messageController.getMessageDetails);

// [Tenant/Admin] Chỉnh sửa tin nhắn
router.put('/:messageId', authenticateToken, messageController.editMessage);

// [Tenant/Admin] Xóa tin nhắn
router.delete('/:messageId', authenticateToken, messageController.deleteMessage);

// [Tenant/Admin] Tải attachment
router.post('/:messageId/attachment', authenticateToken, messageController.uploadAttachment);

module.exports = router;
