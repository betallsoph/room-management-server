const Tenant = require('../models/tenant');
const User = require('../models/user');
const Contract = require('../models/contract');
const ActivityLog = require('../models/activityLog');

// [Admin] Tạo hồ sơ khách thuê
exports.createTenant = async (req, res) => {
  try {
    const { userId, identityCard, phone, emergencyContact, currentUnit } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra identity card đã tồn tại
    const existingTenant = await Tenant.findOne({ identityCard });
    if (existingTenant) {
      return res.status(400).json({ message: 'CCCD/CMND này đã được đăng ký' });
    }

    const tenant = new Tenant({
      userId,
      identityCard,
      phone,
      emergencyContact: emergencyContact || {},
      currentUnit,
      status: 'active'
    });

    await tenant.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'CREATE_TENANT',
      targetType: 'Tenant',
      targetId: tenant._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Tạo hồ sơ khách thuê cho ${user.fullName}`
    });

    res.status(201).json({
      message: 'Hồ sơ khách thuê được tạo thành công',
      tenant
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo hồ sơ khách thuê', error: error.message });
  }
};

// [Admin] Xem danh sách khách thuê
exports.listTenants = async (req, res) => {
  try {
    const { status, building, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    let tenants = await Tenant.find(filter)
      .populate('userId', 'fullName email phone')
      .populate('currentUnit', 'unitNumber building floor')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Filter by building if provided
    if (building) {
      tenants = tenants.filter(t => t.currentUnit?.building === building);
    }

    const total = await Tenant.countDocuments(filter);

    res.json({
      tenants,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách khách thuê', error: error.message });
  }
};

// [Admin] Chi tiết khách thuê
exports.getTenantDetails = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId)
      .populate('userId', 'fullName email phone')
      .populate('currentUnit');

    if (!tenant) {
      return res.status(404).json({ message: 'Khách thuê không tồn tại' });
    }

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết khách thuê', error: error.message });
  }
};

// [Admin] Cập nhật thông tin khách thuê
exports.updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { phone, emergencyContact, status } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Khách thuê không tồn tại' });
    }

    if (phone) tenant.phone = phone;
    if (emergencyContact) tenant.emergencyContact = emergencyContact;
    if (status && ['active', 'inactive', 'moved-out'].includes(status)) {
      tenant.status = status;
    }

    await tenant.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'UPDATE_TENANT',
      targetType: 'Tenant',
      targetId: tenant._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Cập nhật thông tin khách thuê`
    });

    res.json({
      message: 'Cập nhật khách thuê thành công',
      tenant
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật khách thuê', error: error.message });
  }
};

// [Admin] Ghi nhận khách thuê chuyển đi (mark as moved-out)
exports.markTenantMovedOut = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { moveOutDate } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Khách thuê không tồn tại' });
    }

    tenant.moveOutDate = moveOutDate || new Date();
    tenant.status = 'moved-out';
    await tenant.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'TENANT_MOVED_OUT',
      targetType: 'Tenant',
      targetId: tenant._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Khách thuê chuyển đi ngày ${tenant.moveOutDate}`
    });

    res.json({
      message: 'Ghi nhận khách thuê chuyển đi thành công',
      tenant
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi ghi nhận chuyển đi', error: error.message });
  }
};

// [Tenant] Xem hồ sơ của mình
exports.getTenantProfile = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id })
      .populate('userId', 'fullName email phone')
      .populate('currentUnit', 'unitNumber building floor roomType');

    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy hồ sơ', error: error.message });
  }
};

// [Tenant] Cập nhật thông tin liên hệ khẩn cấp
exports.updateEmergencyContact = async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    tenant.emergencyContact = {
      name,
      phone,
      relationship
    };

    await tenant.save();

    res.json({
      message: 'Cập nhật thông tin liên hệ khẩn cấp thành công',
      emergencyContact: tenant.emergencyContact
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật thông tin khẩn cấp', error: error.message });
  }
};

module.exports = exports;
