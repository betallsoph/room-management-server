const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// [Admin] Ghi nhận thanh toán từ khách
router.post('/', authenticateToken, authorize(['admin', 'staff']), paymentController.recordPayment);

// [Admin] Xem danh sách thanh toán
router.get('/', authenticateToken, authorize(['admin', 'staff']), paymentController.listPayments);

// [Tenant] Xem lịch sử thanh toán - PHẢI ĐẶT TRƯỚC /:paymentId
router.get('/my/history', authenticateToken, authorize(['tenant']), paymentController.getTenantPayments);

// [Admin] Theo dõi trạng thái thanh toán - PHẢI ĐẶT TRƯỚC /:paymentId
router.get('/status/summary', authenticateToken, authorize(['admin', 'staff']), paymentController.getPaymentStatus);

// [Admin] Chi tiết thanh toán
router.get('/:paymentId', authenticateToken, paymentController.getPaymentDetails);

// [Admin] Gửi thông tin ngân hàng/MoMo cho khách
router.post('/send-info', authenticateToken, authorize(['admin', 'staff']), paymentController.sendPaymentInfo);

module.exports = router;
