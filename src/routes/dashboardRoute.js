const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/statistics:
 *   get:
 *     tags: [Dashboard]
 *     summary: Lấy thống kê tổng quan dashboard (Admin only)
 *     security: [{bearerAuth: []}]
 *     responses:
 *       200:
 *         description: Thống kê dashboard bao gồm units, tenants, revenue, invoices, tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: {type: string}
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     units:
 *                       type: object
 *                       properties:
 *                         total: {type: integer}
 *                         available: {type: integer}
 *                         occupied: {type: integer}
 *                         maintenance: {type: integer}
 *                         occupancyRate: {type: string}
 *                     tenants:
 *                       type: object
 *                       properties:
 *                         total: {type: integer}
 *                         active: {type: integer}
 *                         inactive: {type: integer}
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         monthly: {type: number}
 *                         total: {type: number}
 *                         byMonth: {type: array}
 *                     invoices:
 *                       type: object
 *                       properties:
 *                         total: {type: integer}
 *                         paid: {type: integer}
 *                         unpaid: {type: integer}
 *                         overdue: {type: integer}
 *                     maintenanceTickets:
 *                       type: object
 *                       properties:
 *                         total: {type: integer}
 *                         pending: {type: integer}
 *                         inProgress: {type: integer}
 *                         completed: {type: integer}
 */
router.get('/statistics', authenticateToken, authorize(['admin']), dashboardController.getDashboardStatistics);

/**
 * @swagger
 * /api/dashboard/activities:
 *   get:
 *     tags: [Dashboard]
 *     summary: Lấy hoạt động gần đây (Admin only)
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: {type: integer, default: 10}
 *         description: Số lượng activities cần lấy
 *     responses:
 *       200:
 *         description: Danh sách hoạt động gần đây từ payments, tickets, contracts
 */
router.get('/activities', authenticateToken, authorize(['admin']), dashboardController.getRecentActivities);

module.exports = router;
