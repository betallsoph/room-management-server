const express = require('express');
const documentController = require('../controllers/documentController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/** @swagger
 * /api/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload tài liệu
 *     security: [{bearerAuth: []}]
 *     responses: {201: {description: Upload thành công}}
 */
router.post('/', authenticateToken, authorize(['tenant']), documentController.uploadDocument);

/** @swagger
 * /api/documents:
 *   get:
 *     tags: [Documents]
 *     summary: Danh sách tài liệu
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách}}
 */
router.get('/', authenticateToken, authorize(['admin']), documentController.listDocuments);

/** @swagger
 * /api/documents/my/list:
 *   get:
 *     tags: [Documents]
 *     summary: Tài liệu của tôi
 *     security: [{bearerAuth: []}]
 *     responses: {200: {description: Danh sách tài liệu}}
 */
router.get('/my/list', authenticateToken, authorize(['tenant']), documentController.getTenantDocuments);

/** @swagger
 * /api/documents/my/{documentId}/download:
 *   get:
 *     tags: [Documents]
 *     summary: Download tài liệu
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: documentId, required: true, schema: {type: string}}]
 *     responses: {200: {description: File download}}
 */
router.get('/my/:documentId/download', authenticateToken, authorize(['tenant']), documentController.downloadDocument);

/** @swagger
 * /api/documents/{documentId}:
 *   get:
 *     tags: [Documents]
 *     summary: Chi tiết tài liệu
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: documentId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Chi tiết}}
 */
router.get('/:documentId', authenticateToken, documentController.getDocumentDetails);

/** @swagger
 * /api/documents/{documentId}/archive:
 *   put:
 *     tags: [Documents]
 *     summary: Lưu trữ tài liệu
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: documentId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Lưu trữ thành công}}
 */
router.put('/:documentId/archive', authenticateToken, authorize(['admin']), documentController.archiveDocument);

/** @swagger
 * /api/documents/{documentId}:
 *   delete:
 *     tags: [Documents]
 *     summary: Xóa tài liệu
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: documentId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Xóa thành công}}
 */
router.delete('/:documentId', authenticateToken, authorize(['admin']), documentController.deleteDocument);

/** @swagger
 * /api/documents/{documentId}/share:
 *   put:
 *     tags: [Documents]
 *     summary: Chia sẻ tài liệu
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: documentId, required: true, schema: {type: string}}]
 *     responses: {200: {description: Chia sẻ thành công}}
 */
router.put('/:documentId/share', authenticateToken, authorize(['admin']), documentController.shareDocument);

module.exports = router;
