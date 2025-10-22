const express = require('express');
const contractController = require('../controllers/contractController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/contracts:
 *   post:
 *     tags: [Contracts]
 *     summary: Tạo hợp đồng mới
 *     description: Admin/Staff tạo hợp đồng thuê mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contract'
 *     responses:
 *       201:
 *         description: Tạo hợp đồng thành công
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền
 */
router.post('/', authenticateToken, authorize(['admin', 'staff']), contractController.createContract);

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     tags: [Contracts]
 *     summary: Danh sách hợp đồng
 *     description: Admin/Staff xem tất cả hợp đồng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách hợp đồng
 *       401:
 *         description: Chưa xác thực
 */
router.get('/', authenticateToken, authorize(['admin', 'staff']), contractController.listContracts);

/**
 * @swagger
 * /api/contracts/my/current:
 *   get:
 *     tags: [Contracts]
 *     summary: Xem hợp đồng hiện tại
 *     description: Tenant xem hợp đồng đang hiệu lực của mình
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hợp đồng hiện tại
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Không tìm thấy hợp đồng
 */
router.get('/my/current', authenticateToken, authorize(['tenant']), contractController.getTenantContract);

/**
 * @swagger
 * /api/contracts/my/history:
 *   get:
 *     tags: [Contracts]
 *     summary: Lịch sử hợp đồng
 *     description: Tenant xem lịch sử các hợp đồng đã ký
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách hợp đồng cũ
 *       401:
 *         description: Chưa xác thực
 */
router.get('/my/history', authenticateToken, authorize(['tenant']), contractController.getTenantContractHistory);

/**
 * @swagger
 * /api/contracts/{contractId}:
 *   get:
 *     tags: [Contracts]
 *     summary: Chi tiết hợp đồng
 *     description: Xem chi tiết một hợp đồng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết hợp đồng
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:contractId', authenticateToken, contractController.getContractDetails);

/**
 * @swagger
 * /api/contracts/{contractId}/sign:
 *   put:
 *     tags: [Contracts]
 *     summary: Ký hợp đồng
 *     description: Admin ký và kích hoạt hợp đồng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ký hợp đồng thành công
 *       403:
 *         description: Không có quyền
 */
router.put('/:contractId/sign', authenticateToken, authorize(['admin']), contractController.signContract);

/**
 * @swagger
 * /api/contracts/{contractId}/terminate:
 *   put:
 *     tags: [Contracts]
 *     summary: Chấm dứt hợp đồng
 *     description: Admin chấm dứt hợp đồng trước hạn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chấm dứt thành công
 *       403:
 *         description: Không có quyền
 */
router.put('/:contractId/terminate', authenticateToken, authorize(['admin']), contractController.terminateContract);

module.exports = router;
