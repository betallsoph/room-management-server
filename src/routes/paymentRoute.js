const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/** @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Ghi nhận thanh toán
 *     security: [{bearerAuth: []}]
 *     responses: {201: {description: Thành công}}
 */
router.post('/', authenticateToken, authorize(['admin', 'staff']), paymentController.recordPayment);

/** @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Danh sách thanh toán
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách}}
 */
router.get('/', authenticateToken, authorize(['admin', 'staff']), paymentController.listPayments);

/** @swagger
 * /api/payments/my/history:
 *   get:
 *     tags: [Payments]
 *     summary: Lịch sử thanh toán (tenant)
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Lịch sử}}
 */
router.get('/my/history', authenticateToken, authorize(['tenant']), paymentController.getTenantPayments);

/** @swagger
 * /api/payments/status/summary:
 *   get:
 *     tags: [Payments]
 *     summary: Tổng quan thanh toán
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Tổng quan}}
 */
router.get('/status/summary', authenticateToken, authorize(['admin', 'staff']), paymentController.getPaymentStatus);

/** @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     tags: [Payments]
 *     summary: Chi tiết thanh toán
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: paymentId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Chi tiết}}
 */
router.get('/:paymentId', authenticateToken, paymentController.getPaymentDetails);

/** @swagger
 * /api/payments/send-info:
 *   post:
 *     tags: [Payments]
 *     summary: Gửi thông tin thanh toán
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Gửi thành công}}
 */
router.post('/send-info', authenticateToken, authorize(['admin', 'staff']), paymentController.sendPaymentInfo);

module.exports = router;
