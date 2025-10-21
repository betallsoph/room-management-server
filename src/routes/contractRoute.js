const express = require('express');
const contractController = require('../controllers/contractController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// [Admin] Tạo hợp đồng
router.post('/', authenticateToken, authorize(['admin', 'staff']), contractController.createContract);

// [Admin] Xem danh sách hợp đồng
router.get('/', authenticateToken, authorize(['admin', 'staff']), contractController.listContracts);

// [Tenant] Xem hợp đồng của mình (PHẢI ĐẶT TRƯỚC /:contractId)
router.get('/my/current', authenticateToken, authorize(['tenant']), contractController.getTenantContract);

// [Tenant] Xem lịch sử hợp đồng (PHẢI ĐẶT TRƯỚC /:contractId)
router.get('/my/history', authenticateToken, authorize(['tenant']), contractController.getTenantContractHistory);

// [Admin] Chi tiết hợp đồng
router.get('/:contractId', authenticateToken, contractController.getContractDetails);

// [Admin] Ký hợp đồng
router.put('/:contractId/sign', authenticateToken, authorize(['admin']), contractController.signContract);

// [Admin] Kết thúc hợp đồng
router.put('/:contractId/terminate', authenticateToken, authorize(['admin']), contractController.terminateContract);

module.exports = router;
