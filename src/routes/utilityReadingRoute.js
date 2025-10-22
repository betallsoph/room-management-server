const express = require('express');
const utilityReadingController = require('../controllers/utilityReadingController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/** @swagger
 * /api/utility-readings:
 *   post:
 *     tags: [Utility Readings]
 *     summary: Gửi chỉ số điện nước
 *     security: [{bearerAuth: []}]
 *     responses: {201: {description: Gửi thành công}}
 */
router.post('/', authenticateToken, authorize(['tenant']), utilityReadingController.submitUtilityReading);

/** @swagger
 * /api/utility-readings:
 *   get:
 *     tags: [Utility Readings]
 *     summary: Danh sách chỉ số chờ xác nhận
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách}}
 */
router.get('/', authenticateToken, authorize(['admin']), utilityReadingController.listPendingReadings);

/** @swagger
 * /api/utility-readings/my/history:
 *   get:
 *     tags: [Utility Readings]
 *     summary: Lịch sử chỉ số (tenant)
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Lịch sử}}
 */
router.get('/my/history', authenticateToken, authorize(['tenant']), utilityReadingController.getTenantReadingHistory);

/** @swagger
 * /api/utility-readings/{readingId}:
 *   get:
 *     tags: [Utility Readings]
 *     summary: Chi tiết chỉ số
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: readingId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Chi tiết}}
 */
router.get('/:readingId', authenticateToken, utilityReadingController.getReadingDetails);

/** @swagger
 * /api/utility-readings/{readingId}/verify:
 *   put:
 *     tags: [Utility Readings]
 *     summary: Xác nhận chỉ số
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: readingId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Xác nhận thành công}}
 */
router.put('/:readingId/verify', authenticateToken, authorize(['admin']), utilityReadingController.verifyReading);

/** @swagger
 * /api/utility-readings/{readingId}/reject:
 *   put:
 *     tags: [Utility Readings]
 *     summary: Từ chối chỉ số
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: readingId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Từ chối thành công}}
 */
router.put('/:readingId/reject', authenticateToken, authorize(['admin']), utilityReadingController.rejectReading);

module.exports = router;
