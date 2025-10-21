const express = require('express');
const maintenanceTicketController = require('../controllers/maintenanceTicketController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// [Tenant] Báo cáo sự cố
router.post('/', authenticateToken, authorize(['tenant']), maintenanceTicketController.createMaintenanceTicket);

// [Admin] Xem danh sách sự cố
router.get('/', authenticateToken, authorize(['admin', 'staff']), maintenanceTicketController.listMaintenanceTickets);

// [Tenant] Xem danh sách sự cố của mình - PHẢI ĐẶT TRƯỚC /:ticketId
router.get('/my/tickets', authenticateToken, authorize(['tenant']), maintenanceTicketController.getTenantTickets);

// [Admin] Chi tiết sự cố
router.get('/:ticketId', authenticateToken, maintenanceTicketController.getTicketDetails);

// [Admin] Gán sự cố cho nhân viên
router.put('/:ticketId/assign', authenticateToken, authorize(['admin', 'staff']), maintenanceTicketController.assignTicket);

// [Admin/Staff] Cập nhật trạng thái sự cố
router.put('/:ticketId/status', authenticateToken, authorize(['admin', 'staff']), maintenanceTicketController.updateTicketStatus);

module.exports = router;
