const express = require('express');
const tenantController = require('../controllers/tenantController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// [Admin] Tạo hồ sơ khách thuê
router.post('/', authenticateToken, authorize(['admin', 'staff']), tenantController.createTenant);

// [Admin] Xem danh sách khách thuê
router.get('/', authenticateToken, authorize(['admin', 'staff']), tenantController.listTenants);

// [Tenant] Xem hồ sơ của mình (PHẢI ĐẶT TRƯỚC /:tenantId)
router.get('/my-profile', authenticateToken, authorize(['tenant']), tenantController.getTenantProfile);

// [Admin] Chi tiết khách thuê
router.get('/:tenantId', authenticateToken, authorize(['admin', 'staff']), tenantController.getTenantDetails);

// [Admin] Cập nhật thông tin khách thuê
router.put('/:tenantId', authenticateToken, authorize(['admin', 'staff']), tenantController.updateTenant);

// [Tenant] Cập nhật thông tin liên hệ khẩn cấp (PHẢI ĐẶT TRƯỚC /:tenantId/moved-out)
router.put('/my-profile/emergency-contact', authenticateToken, authorize(['tenant']), tenantController.updateEmergencyContact);

// [Admin] Ghi nhận khách thuê chuyển đi
router.put('/:tenantId/moved-out', authenticateToken, authorize(['admin']), tenantController.markTenantMovedOut);

module.exports = router;
