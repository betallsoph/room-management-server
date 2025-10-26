const Tenant = require('../models/tenant');
const User = require('../models/user');
const Contract = require('../models/contract');
const ActivityLog = require('../models/activityLog');

// [Admin] Tạo hồ sơ khách thuê
exports.createTenant = async (req, res) => {
  try {
    const { userId, identityCard, phone, emergencyContact, currentUnit, moveInDate } = req.body;

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
      moveInDate: moveInDate || null,
      status: 'active'
    });

    await tenant.save();

    // Update unit status to occupied and link tenant if unit is assigned
    if (currentUnit) {
      try {
        const Unit = require('../models/unit');
        await Unit.findByIdAndUpdate(currentUnit, { 
          status: 'occupied',
          currentTenant: tenant._id
        });
      } catch (err) {
        console.error('Error updating unit:', err.message);
      }
    }

    await ActivityLog.create({
      user: req.user.id,
      action: 'CREATE_TENANT',
      targetType: 'Tenant',
      targetId: tenant._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Tạo hồ sơ khách thuê cho ${user.fullName}`
    });

    // Populate user and unit info before returning
    try {
      await tenant.populate('userId', 'fullName email phone');
      if (tenant.currentUnit) {
        await tenant.populate('currentUnit', 'unitNumber building floor');
      }
    } catch (populateError) {
      console.error('Populate error (non-critical):', populateError);
      // Continue even if populate fails
    }

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
    const { phone, emergencyContact, status, currentUnit, moveInDate, moveOutDate } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Khách thuê không tồn tại' });
    }

    const oldUnit = tenant.currentUnit;

    // Update fields if provided
    if (phone) tenant.phone = phone;
    if (emergencyContact) tenant.emergencyContact = emergencyContact;
    if (status && ['active', 'inactive', 'moved-out'].includes(status)) {
      tenant.status = status;
    }
    
    // Allow updating currentUnit (can be null to unassign)
    if (currentUnit !== undefined) {
      tenant.currentUnit = currentUnit || null;
    }
    
    // Allow updating move dates
    if (moveInDate !== undefined) {
      tenant.moveInDate = moveInDate || null;
    }
    if (moveOutDate !== undefined) {
      tenant.moveOutDate = moveOutDate || null;
    }

    // Update timestamp
    tenant.updatedAt = new Date();

    await tenant.save();

    // Update unit status and currentTenant
    const Unit = require('../models/unit');
    
    // If old unit exists and we're changing units, clear old unit
    if (oldUnit && (!currentUnit || oldUnit.toString() !== currentUnit.toString())) {
      try {
        await Unit.findByIdAndUpdate(oldUnit, { 
          status: 'available',
          currentTenant: null 
        });
      } catch (err) {
        console.error('Error updating old unit:', err.message);
      }
    }
    
    // If tenant moved out, clear current unit
    if (tenant.status === 'moved-out' && tenant.currentUnit) {
      try {
        await Unit.findByIdAndUpdate(tenant.currentUnit, { 
          status: 'available',
          currentTenant: null
        });
      } catch (err) {
        console.error('Error updating unit on move-out:', err.message);
      }
    }
    // If new unit is assigned and tenant is active, set unit to occupied
    else if (currentUnit && tenant.status === 'active') {
      try {
        await Unit.findByIdAndUpdate(currentUnit, { 
          status: 'occupied',
          currentTenant: tenant._id
        });
      } catch (err) {
        console.error('Error updating new unit:', err.message);
      }
    }

    // Create activity log (non-blocking)
    try {
      await ActivityLog.create({
        user: req.user.id,
        action: 'UPDATE_TENANT',
        targetType: 'Tenant',
        targetId: tenant._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: `Cập nhật thông tin khách thuê`
      });
    } catch (logError) {
      // Continue even if logging fails
    }

    // Populate user and unit info before returning
    try {
      await tenant.populate('userId', 'fullName email phone');
      if (tenant.currentUnit) {
        await tenant.populate('currentUnit', 'unitNumber building floor');
      }
    } catch (populateError) {
      // Continue even if populate fails
    }

    res.json({
      message: 'Cập nhật khách thuê thành công',
      tenant
    });
  } catch (error) {
    console.error('Update tenant error:', error);
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
      .populate('currentUnit', 'unitNumber building floor roomType squareMeters rentPrice depositAmount amenities description');

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

// [Tenant] Upload identity documents (CCCD/VNeID images) - with file upload
exports.uploadDocuments = async (req, res) => {
  try {
    console.log('=== Upload Documents Request ===');
    console.log('User ID:', req.user?.id);
    console.log('Files received:', req.files);
    console.log('Body:', req.body);

    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      console.log('Tenant not found for user:', req.user.id);
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    console.log('Tenant found:', tenant._id);

    // Get uploaded files from multer
    const files = req.files;
    
    if (!files || Object.keys(files).length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất một file để upload' });
    }

    console.log('Files to process:', Object.keys(files));

    // Initialize documents object if it doesn't exist
    if (!tenant.documents) {
      tenant.documents = {};
      console.log('Initialized documents object');
    }

    // Update document paths - store relative paths
    if (files.identityCardFront && files.identityCardFront[0]) {
      tenant.documents.identityCardFront = `/uploads/documents/${files.identityCardFront[0].filename}`;
      console.log('Updated identityCardFront:', tenant.documents.identityCardFront);
    }
    if (files.identityCardBack && files.identityCardBack[0]) {
      tenant.documents.identityCardBack = `/uploads/documents/${files.identityCardBack[0].filename}`;
      console.log('Updated identityCardBack:', tenant.documents.identityCardBack);
    }
    if (files.vneidImage && files.vneidImage[0]) {
      tenant.documents.vneidImage = `/uploads/documents/${files.vneidImage[0].filename}`;
      console.log('Updated vneidImage:', tenant.documents.vneidImage);
    }

    // Mark documents field as modified for Mongoose
    tenant.markModified('documents');
    
    console.log('Saving tenant...');
    await tenant.save();
    console.log('Tenant saved successfully');

    await ActivityLog.create({
      adminId: req.user.id,
      action: 'UPDATE',
      targetType: 'TENANT',
      targetId: tenant._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { message: 'Cập nhật hình ảnh giấy tờ tùy thân' }
    });

    console.log('Activity log created');
    console.log('=== Upload Successful ===');

    res.json({
      message: 'Upload giấy tờ tùy thân thành công',
      documents: tenant.documents
    });
  } catch (error) {
    console.error('=== Upload Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Lỗi upload giấy tờ', error: error.message });
  }
};

// [Admin] Xóa khách thuê
exports.deleteTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Khách thuê không tồn tại' });
    }

    // Check if tenant has active contracts
    const activeContracts = await Contract.countDocuments({
      tenant: tenantId,
      status: 'active'
    });

    if (activeContracts > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa khách thuê đang có hợp đồng hoạt động. Vui lòng kết thúc hợp đồng trước.' 
      });
    }

    await ActivityLog.create({
      user: req.user.id,
      action: 'DELETE_TENANT',
      targetType: 'Tenant',
      targetId: tenant._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Xóa khách thuê ${tenant.identityCard}`
    });

    await Tenant.findByIdAndDelete(tenantId);

    res.json({
      message: 'Xóa khách thuê thành công'
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa khách thuê', error: error.message });
  }
};

module.exports = exports;
