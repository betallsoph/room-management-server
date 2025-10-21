const UtilityReading = require('../models/utilityReading');
const Contract = require('../models/contract');
const Tenant = require('../models/tenant');
const ActivityLog = require('../models/activityLog');
const Notification = require('../models/notification');

// [Tenant] Gửi chỉ số điện nước cuối tháng
exports.submitUtilityReading = async (req, res) => {
  try {
    const {
      month,
      year,
      electricityReading,
      waterReading,
      notes
    } = req.body;

    // Get tenant info
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    if (!tenant.currentUnit) {
      return res.status(400).json({ message: 'Bạn không đang thuê phòng nào' });
    }

    // Get current contract
    const contract = await Contract.findOne({
      tenant: tenant._id,
      status: 'active'
    });

    if (!contract) {
      return res.status(400).json({ message: 'Bạn không có hợp đồng hiệu lực' });
    }

    // Get previous reading
    const previousReading = await UtilityReading.findOne({
      contract: contract._id,
      month: month - 1 || 12,
      year: month === 1 ? year - 1 : year,
      status: 'verified'
    });

    // Calculate usage
    const electricityUsage = electricityReading - (previousReading?.electricity?.currentReading || 0);
    const waterUsage = waterReading - (previousReading?.water?.currentReading || 0);

    const reading = new UtilityReading({
      contract: contract._id,
      unit: tenant.currentUnit,
      tenant: tenant._id,
      month,
      year,
      electricity: {
        previousReading: previousReading?.electricity?.currentReading || 0,
        currentReading: electricityReading,
        usage: electricityUsage,
        unitPrice: contract.utilities?.electricityPrice || 3500, // Default price
        totalCost: electricityUsage * (contract.utilities?.electricityPrice || 3500)
      },
      water: {
        previousReading: previousReading?.water?.currentReading || 0,
        currentReading: waterReading,
        usage: waterUsage,
        unitPrice: contract.utilities?.waterPrice || 20000, // Default price
        totalCost: waterUsage * (contract.utilities?.waterPrice || 20000)
      },
      status: 'submitted',
      submittedDate: new Date(),
      notes
    });

    await reading.save();

    // Tạo notification cho chủ nhà
    await Notification.create({
      recipient: contract.landlord,
      notificationType: 'utility-reading-requested',
      title: `Chỉ số điện nước tháng ${month}/${year}`,
      message: `Khách thuê đã gửi chỉ số điện nước: Điện ${electricityReading} kWh, Nước ${waterReading} m³`,
      relatedEntity: {
        entityType: 'utility-reading',
        entityId: reading._id
      },
      actionUrl: `/utility-readings/${reading._id}`,
      sendMethod: 'in-app'
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'SUBMIT_UTILITY_READING',
      targetType: 'UtilityReading',
      targetId: reading._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Gửi chỉ số điện nước tháng ${month}/${year}`
    });

    res.status(201).json({
      message: 'Gửi chỉ số điện nước thành công',
      reading
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi chỉ số điện nước', error: error.message });
  }
};

// [Admin] Xem danh sách chỉ số điện nước chưa xác nhận
exports.listPendingReadings = async (req, res) => {
  try {
    const { month, year, building, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { status: 'submitted' };
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    let readings = await UtilityReading.find(filter)
      .populate('contract')
      .populate('unit', 'unitNumber building')
      .populate('tenant', 'identityCard')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ submittedDate: -1 });

    if (building) {
      readings = readings.filter(r => r.unit?.building === building);
    }

    const total = await UtilityReading.countDocuments(filter);

    res.json({
      readings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách chỉ số', error: error.message });
  }
};

// [Admin] Chi tiết chỉ số điện nước
exports.getReadingDetails = async (req, res) => {
  try {
    const { readingId } = req.params;

    const reading = await UtilityReading.findById(readingId)
      .populate('contract')
      .populate('unit')
      .populate('tenant')
      .populate('verifiedBy', 'fullName');

    if (!reading) {
      return res.status(404).json({ message: 'Chỉ số không tồn tại' });
    }

    res.json(reading);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết chỉ số', error: error.message });
  }
};

// [Admin] Xác nhận chỉ số điện nước
exports.verifyReading = async (req, res) => {
  try {
    const { readingId } = req.params;
    const { adjustedElectricityUsage, adjustedWaterUsage, notes } = req.body;

    const reading = await UtilityReading.findById(readingId);
    if (!reading) {
      return res.status(404).json({ message: 'Chỉ số không tồn tại' });
    }

    // Allow adjustment if needed
    if (adjustedElectricityUsage !== undefined) {
      reading.electricity.usage = adjustedElectricityUsage;
      reading.electricity.totalCost = adjustedElectricityUsage * reading.electricity.unitPrice;
    }

    if (adjustedWaterUsage !== undefined) {
      reading.water.usage = adjustedWaterUsage;
      reading.water.totalCost = adjustedWaterUsage * reading.water.unitPrice;
    }

    reading.status = 'verified';
    reading.verifiedDate = new Date();
    reading.verifiedBy = req.user.id;
    if (notes) reading.notes = notes;

    await reading.save();

    // Tạo notification cho khách thuê
    await Notification.create({
      recipient: reading.tenant,
      notificationType: 'utility-reading-requested',
      title: `Chỉ số điện nước được xác nhận`,
      message: `Chỉ số điện nước tháng ${reading.month}/${reading.year} của bạn đã được xác nhận`,
      relatedEntity: {
        entityType: 'utility-reading',
        entityId: reading._id
      },
      sendMethod: 'in-app'
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'VERIFY_READING',
      targetType: 'UtilityReading',
      targetId: reading._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Xác nhận chỉ số điện nước tháng ${reading.month}/${reading.year}`
    });

    res.json({
      message: 'Xác nhận chỉ số thành công',
      reading
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xác nhận chỉ số', error: error.message });
  }
};

// [Admin] Từ chối chỉ số điện nước (yêu cầu gửi lại)
exports.rejectReading = async (req, res) => {
  try {
    const { readingId } = req.params;
    const { reason } = req.body;

    const reading = await UtilityReading.findById(readingId);
    if (!reading) {
      return res.status(404).json({ message: 'Chỉ số không tồn tại' });
    }

    reading.status = 'rejected';
    reading.notes = reason || 'Yêu cầu gửi lại chỉ số';

    await reading.save();

    // Tạo notification cho khách thuê
    await Notification.create({
      recipient: reading.tenant,
      notificationType: 'system-alert',
      title: `Chỉ số điện nước bị từ chối`,
      message: `Chỉ số điện nước tháng ${reading.month}/${reading.year} của bạn bị từ chối. Lý do: ${reason}`,
      relatedEntity: {
        entityType: 'utility-reading',
        entityId: reading._id
      },
      sendMethod: 'in-app'
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'REJECT_READING',
      targetType: 'UtilityReading',
      targetId: reading._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Từ chối chỉ số tháng ${reading.month}/${reading.year}`
    });

    res.json({
      message: 'Từ chối chỉ số thành công',
      reading
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối chỉ số', error: error.message });
  }
};

// [Tenant] Xem lịch sử chỉ số của mình
exports.getTenantReadingHistory = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    const readings = await UtilityReading.find({ tenant: tenant._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      readings,
      count: readings.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử chỉ số', error: error.message });
  }
};

module.exports = exports;
