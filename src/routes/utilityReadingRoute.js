const express = require('express');
const utilityReadingController = require('../controllers/utilityReadingController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// [Tenant] Gửi chỉ số điện nước
router.post('/', authenticateToken, authorize(['tenant']), utilityReadingController.submitUtilityReading);

// [Admin] Xem danh sách chỉ số chưa xác nhận
router.get('/', authenticateToken, authorize(['admin', 'staff']), utilityReadingController.listPendingReadings);

// [Tenant] Xem lịch sử chỉ số của mình - PHẢI ĐẶT TRƯỚC /:readingId
router.get('/my/history', authenticateToken, authorize(['tenant']), utilityReadingController.getTenantReadingHistory);

// [Admin] Chi tiết chỉ số
router.get('/:readingId', authenticateToken, utilityReadingController.getReadingDetails);

// [Admin] Xác nhận chỉ số điện nước
router.put('/:readingId/verify', authenticateToken, authorize(['admin', 'staff']), utilityReadingController.verifyReading);

// [Admin] Từ chối chỉ số điện nước
router.put('/:readingId/reject', authenticateToken, authorize(['admin', 'staff']), utilityReadingController.rejectReading);

module.exports = router;
