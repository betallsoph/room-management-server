const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// [Admin] Tạo hóa đơn
router.post('/', authenticateToken, authorize(['admin', 'staff']), invoiceController.createInvoice);

// [Admin] Xem danh sách hóa đơn
router.get('/', authenticateToken, authorize(['admin', 'staff']), invoiceController.listInvoices);

// [Tenant] Xem danh sách hóa đơn của mình (PHẢI ĐẶT TRƯỚC /:invoiceId)
router.get('/my/list', authenticateToken, authorize(['tenant']), invoiceController.getTenantInvoices);

// [Tenant] Xem lịch sử thanh toán (PHẢI ĐẶT TRƯỚC /:invoiceId)
router.get('/my/payment-history', authenticateToken, authorize(['tenant']), invoiceController.getTenantPaymentHistory);

// [Tenant] Xem chi tiết hóa đơn (PHẢI ĐẶT TRƯỚC /:invoiceId)
router.get('/my/:invoiceId', authenticateToken, authorize(['tenant']), invoiceController.getTenantInvoiceDetails);

// [Admin] Chi tiết hóa đơn
router.get('/:invoiceId', authenticateToken, invoiceController.getInvoiceDetails);

// [Admin] Xác nhận thanh toán & đánh dấu tình trạng
router.put('/:invoiceId/confirm-payment', authenticateToken, authorize(['admin', 'staff']), invoiceController.confirmPayment);

module.exports = router;
