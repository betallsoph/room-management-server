const express = require('express');
const maintenanceTicketController = require('../controllers/maintenanceTicketController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/** @swagger
 * /api/maintenance-tickets:
 *   post:
 *     tags: [Maintenance Tickets]
 *     summary: Báo cáo sự cố
 *     security: [{bearerAuth: []}]
 *     responses: {201: {description: Tạo thành công}}
 */
router.post('/', authenticateToken, authorize(['tenant']), maintenanceTicketController.createMaintenanceTicket);

/** @swagger
 * /api/maintenance-tickets:
 *   get:
 *     tags: [Maintenance Tickets]
 *     summary: Danh sách sự cố
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách}}
 */
router.get('/', authenticateToken, authorize(['admin']), maintenanceTicketController.listMaintenanceTickets);

/** @swagger
 * /api/maintenance-tickets/my/tickets:
 *   get:
 *     tags: [Maintenance Tickets]
 *     summary: Sự cố của tôi
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách sự cố}}
 */
router.get('/my/tickets', authenticateToken, authorize(['tenant']), maintenanceTicketController.getTenantTickets);

/** @swagger
 * /api/maintenance-tickets/{ticketId}:
 *   get:
 *     tags: [Maintenance Tickets]
 *     summary: Chi tiết sự cố
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: ticketId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Chi tiết}}
 */
router.get('/:ticketId', authenticateToken, maintenanceTicketController.getTicketDetails);

/** @swagger
 * /api/maintenance-tickets/{ticketId}/assign:
 *   put:
 *     tags: [Maintenance Tickets]
 *     summary: Gán nhân viên xử lý
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: ticketId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Gán thành công}}
 */
router.put('/:ticketId/assign', authenticateToken, authorize(['admin']), maintenanceTicketController.assignTicket);

/** @swagger
 * /api/maintenance-tickets/{ticketId}/status:
 *   put:
 *     tags: [Maintenance Tickets]
 *     summary: Cập nhật trạng thái
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: ticketId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Cập nhật thành công}}
 */
router.put('/:ticketId/status', authenticateToken, authorize(['admin']), maintenanceTicketController.updateTicketStatus);

module.exports = router;
