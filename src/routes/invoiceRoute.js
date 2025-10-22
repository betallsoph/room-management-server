const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     tags: [Invoices]
 *     summary: Tạo hóa đơn mới
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tạo hóa đơn thành công
 */
router.post('/', authenticateToken, authorize(['admin', 'staff']), invoiceController.createInvoice);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: Danh sách hóa đơn
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách hóa đơn
 */
router.get('/', authenticateToken, authorize(['admin', 'staff']), invoiceController.listInvoices);

/**
 * @swagger
 * /api/invoices/my/list:
 *   get:
 *     tags: [Invoices]
 *     summary: Hóa đơn của tôi
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách hóa đơn của tenant
 */
router.get('/my/list', authenticateToken, authorize(['tenant']), invoiceController.getTenantInvoices);

/**
 * @swagger
 * /api/invoices/my/payment-history:
 *   get:
 *     tags: [Invoices]
 *     summary: Lịch sử thanh toán
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lịch sử thanh toán
 */
router.get('/my/payment-history', authenticateToken, authorize(['tenant']), invoiceController.getTenantPaymentHistory);

/**
 * @swagger
 * /api/invoices/my/{invoiceId}:
 *   get:
 *     tags: [Invoices]
 *     summary: Chi tiết hóa đơn (tenant)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết hóa đơn
 */
router.get('/my/:invoiceId', authenticateToken, authorize(['tenant']), invoiceController.getTenantInvoiceDetails);

/**
 * @swagger
 * /api/invoices/{invoiceId}:
 *   get:
 *     tags: [Invoices]
 *     summary: Chi tiết hóa đơn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết hóa đơn
 */
router.get('/:invoiceId', authenticateToken, invoiceController.getInvoiceDetails);

/**
 * @swagger
 * /api/invoices/{invoiceId}/confirm-payment:
 *   put:
 *     tags: [Invoices]
 *     summary: Xác nhận thanh toán
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xác nhận thành công
 */
router.put('/:invoiceId/confirm-payment', authenticateToken, authorize(['admin', 'staff']), invoiceController.confirmPayment);

module.exports = router;
