const express = require('express');
const {
  getAllUsers,
  getUserDetail,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getUserStats
} = require('../controllers/adminController');
const {
  getActivityLogs,
  clearOldLogs
} = require('../controllers/activityLogController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// Tất cả routes admin yêu cầu xác thực và role admin
router.use(authenticateToken, authorize(['admin']));

/** @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Danh sách tất cả users
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách users}}
 */
router.get('/users', getAllUsers);

/** @swagger
 * /api/admin/users/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Thống kê users
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Thống kê}}
 */
router.get('/users/stats', getUserStats);

/** @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Chi tiết user
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: id, required: true, schema: {type: string}}]
 *     responses: {200: {description: Chi tiết}}
 */
router.get('/users/:id', getUserDetail);

/** @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     tags: [Admin]
 *     summary: Thay đổi role user
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: id, required: true, schema: {type: string}}]
 *     responses: {200: {description: Cập nhật thành công}}
 */
router.put('/users/:id/role', updateUserRole);

/** @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Bật/tắt tài khoản
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: id, required: true, schema: {type: string}}]
 *     responses: {200: {description: Cập nhật thành công}}
 */
router.put('/users/:id/status', toggleUserStatus);

/** @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Xóa user
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: id, required: true, schema: {type: string}}]
 *     responses: {200: {description: Xóa thành công}}
 */
router.delete('/users/:id', deleteUser);

/** @swagger
 * /api/admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: Xem activity logs
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách logs}}
 */
router.get('/logs', getActivityLogs);

/** @swagger
 * /api/admin/logs/clear:
 *   post:
 *     tags: [Admin]
 *     summary: Xóa logs cũ
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Xóa thành công}}
 */
router.post('/logs/clear', clearOldLogs);

module.exports = router;
