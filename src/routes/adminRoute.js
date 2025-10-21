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

// User management
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Activity logs
router.get('/logs', getActivityLogs);
router.post('/logs/clear', clearOldLogs);

module.exports = router;
