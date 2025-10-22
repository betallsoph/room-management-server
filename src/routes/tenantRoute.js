const express = require('express');
const tenantController = require('../controllers/tenantController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/** @swagger
 * /api/tenants:
 *   post:
 *     tags: [Tenants]
 *     summary: Tạo hồ sơ khách thuê
 *     security: [{bearerAuth: []}]
 *     responses: {201: {description: Tạo thành công}}
 */
router.post('/', authenticateToken, authorize(['admin', 'staff']), tenantController.createTenant);

/** @swagger
 * /api/tenants:
 *   get:
 *     tags: [Tenants]
 *     summary: Danh sách khách thuê
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách}}
 */
router.get('/', authenticateToken, authorize(['admin', 'staff']), tenantController.listTenants);

/** @swagger
 * /api/tenants/my-profile:
 *   get:
 *     tags: [Tenants]
 *     summary: Xem hồ sơ của tôi
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Hồ sơ tenant}}
 */
router.get('/my-profile', authenticateToken, authorize(['tenant']), tenantController.getTenantProfile);

/** @swagger
 * /api/tenants/{tenantId}:
 *   get:
 *     tags: [Tenants]
 *     summary: Chi tiết khách thuê
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: tenantId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Chi tiết}}
 */
router.get('/:tenantId', authenticateToken, authorize(['admin', 'staff']), tenantController.getTenantDetails);

/** @swagger
 * /api/tenants/{tenantId}:
 *   put:
 *     tags: [Tenants]
 *     summary: Cập nhật thông tin khách thuê
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: tenantId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Cập nhật thành công}}
 */
router.put('/:tenantId', authenticateToken, authorize(['admin', 'staff']), tenantController.updateTenant);

/** @swagger
 * /api/tenants/my-profile/emergency-contact:
 *   put:
 *     tags: [Tenants]
 *     summary: Cập nhật liên hệ khẩn cấp
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Cập nhật thành công}}
 */
router.put('/my-profile/emergency-contact', authenticateToken, authorize(['tenant']), tenantController.updateEmergencyContact);

/** @swagger
 * /api/tenants/{tenantId}/moved-out:
 *   put:
 *     tags: [Tenants]
 *     summary: Đánh dấu khách đã chuyển đi
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: tenantId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Cập nhật thành công}}
 */
router.put('/:tenantId/moved-out', authenticateToken, authorize(['admin']), tenantController.markTenantMovedOut);

module.exports = router;
