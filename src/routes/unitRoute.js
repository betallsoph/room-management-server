const express = require('express');
const unitController = require('../controllers/unitController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/units:
 *   post:
 *     tags: [Units]
 *     summary: Tạo phòng/căn hộ mới
 *     description: Admin tạo phòng mới trong hệ thống (chỉ admin/staff)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitNumber
 *               - building
 *               - floor
 *               - roomType
 *               - rentPrice
 *             properties:
 *               unitNumber:
 *                 type: string
 *                 example: A101
 *               building:
 *                 type: string
 *                 example: A
 *               floor:
 *                 type: integer
 *                 example: 1
 *               squareMeters:
 *                 type: number
 *                 example: 45.5
 *               roomType:
 *                 type: string
 *                 enum: [studio, one-bedroom, two-bedroom, three-bedroom]
 *               rentPrice:
 *                 type: number
 *                 example: 5000000
 *               depositAmount:
 *                 type: number
 *                 example: 10000000
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [air-conditioner, water-heater, balcony]
 *     responses:
 *       201:
 *         description: Tạo phòng thành công
 *       400:
 *         description: Unit số này đã tồn tại
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền
 */
router.post('/', authenticateToken, authorize(['admin']), unitController.createUnit);

/**
 * @swagger
 * /api/units:
 *   get:
 *     tags: [Units]
 *     summary: Xem danh sách phòng
 *     description: Lấy danh sách phòng với filter theo building, status, floor (admin/staff)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: building
 *         schema:
 *           type: string
 *         description: Lọc theo toà nhà
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, occupied, maintenance]
 *         description: Lọc theo trạng thái phòng
 *       - in: query
 *         name: floor
 *         schema:
 *           type: integer
 *         description: Lọc theo tầng
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách phòng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 units:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Unit'
 *                 pagination:
 *                   type: object
 */
router.get('/', authenticateToken, authorize(['admin']), unitController.listUnits);

/**
 * @swagger
 * /api/units/{unitId}:
 *   get:
 *     tags: [Units]
 *     summary: Xem chi tiết phòng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết phòng
 *   put:
 *     tags: [Units]
 *     summary: Cập nhật thông tin phòng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rentPrice:
 *                 type: number
 *               depositAmount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, occupied, maintenance]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     tags: [Units]
 *     summary: Xóa phòng (chỉ admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
/**
 * @swagger
 * /api/units/available/listing:
 *   get:
 *     tags: [Units]
 *     summary: Danh sách phòng trống (để giới thiệu bạn bè)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phòng trống
 */
router.get('/available/listing', authenticateToken, authorize(['admin']), unitController.getAvailableUnitsForListing);

router.get('/:unitId', authenticateToken, unitController.getUnitDetails);
router.put('/:unitId', authenticateToken, authorize(['admin']), unitController.updateUnit);
router.delete('/:unitId', authenticateToken, authorize(['admin']), unitController.deleteUnit);

/**
 * @swagger
 * /api/units/{unitId}/my-unit:
 *   get:
 *     tags: [Units]
 *     summary: Xem chi tiết phòng mình đang thuê (tenant)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết phòng
 */
router.get('/:unitId/my-unit', authenticateToken, authorize(['tenant']), unitController.getTenantUnitDetails);

module.exports = router;
