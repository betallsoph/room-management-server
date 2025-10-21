const express = require('express');
const documentController = require('../controllers/documentController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

// [Tenant] Upload giấy tờ
router.post('/', authenticateToken, authorize(['tenant']), documentController.uploadDocument);

// [Admin] Xem danh sách tài liệu
router.get('/', authenticateToken, authorize(['admin', 'staff']), documentController.listDocuments);

// [Tenant] Xem danh sách tài liệu của mình - PHẢI ĐẶT TRƯỚC /:documentId
router.get('/my/list', authenticateToken, authorize(['tenant']), documentController.getTenantDocuments);

// [Tenant] Download tài liệu - PHẢI ĐẶT TRƯỚC /:documentId
router.get('/my/:documentId/download', authenticateToken, authorize(['tenant']), documentController.downloadDocument);

// [Admin] Chi tiết tài liệu
router.get('/:documentId', authenticateToken, documentController.getDocumentDetails);

// [Admin] Lưu trữ tài liệu
router.put('/:documentId/archive', authenticateToken, authorize(['admin', 'staff']), documentController.archiveDocument);

// [Admin] Xóa tài liệu
router.delete('/:documentId', authenticateToken, authorize(['admin']), documentController.deleteDocument);

// [Admin] Chia sẻ tài liệu cho khách
router.put('/:documentId/share', authenticateToken, authorize(['admin', 'staff']), documentController.shareDocument);

module.exports = router;
