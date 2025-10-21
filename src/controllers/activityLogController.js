const ActivityLog = require('../models/activityLog');

// Ghi log hoạt động
const logActivity = async (adminId, action, targetType, targetId = null, details = {}, req = null) => {
  try {
    const logData = {
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.get('user-agent') || 'unknown'
    };

    await ActivityLog.create(logData);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Không throw error, chỉ log để không ảnh hưởng đến hệ thống
  }
};

// Lấy logs
const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, targetType, adminId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    if (adminId) filter.adminId = adminId;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('adminId', 'fullName email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      ActivityLog.countDocuments(filter)
    ]);

    return res.json({
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Xoá logs cũ
const clearOldLogs = async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await ActivityLog.deleteMany({ createdAt: { $lt: cutoffDate } });

    return res.json({
      message: `Deleted ${result.deletedCount} logs older than ${daysOld} days`
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  logActivity,
  getActivityLogs,
  clearOldLogs
};
