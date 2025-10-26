const Unit = require('../models/unit');
const ActivityLog = require('../models/activityLog');

// [Admin] Tạo phòng mới
exports.createUnit = async (req, res) => {
  try {
    const { unitNumber, building, floor, squareMeters, roomType, rentPrice, depositAmount, amenities } = req.body;

    // Kiểm tra unitNumber đã tồn tại
    const existingUnit = await Unit.findOne({ unitNumber, building });
    if (existingUnit) {
      return res.status(400).json({ message: 'Unit số này đã tồn tại trong toà nhà này' });
    }

    const unit = new Unit({
      unitNumber,
      building,
      floor,
      squareMeters,
      roomType,
      rentPrice,
      depositAmount,
      amenities: amenities || [],
      landlord: req.user.id,
      status: 'available'
    });

    await unit.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'CREATE_UNIT',
      targetType: 'Unit',
      targetId: unit._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Tạo phòng ${unitNumber} tại ${building}`
    });

    // Populate landlord info before returning
    await unit.populate('landlord', 'fullName email');

    res.status(201).json({
      message: 'Phòng được tạo thành công',
      unit
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo phòng', error: error.message });
  }
};

// [Admin] Xem danh sách phòng (có thể filter theo building, status, floor)
exports.listUnits = async (req, res) => {
  try {
    const { building, status, floor, roomType, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter - Admin có thể xem tất cả phòng
    const filter = {};
    if (building) filter.building = building;
    if (status) filter.status = status;
    if (floor) filter.floor = parseInt(floor);
    if (roomType) filter.roomType = roomType;

    const units = await Unit.find(filter)
      .populate('landlord', 'fullName email')
      .populate({
        path: 'currentTenant',
        select: 'userId phone status',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ building: 1, floor: 1, unitNumber: 1 });

    const total = await Unit.countDocuments(filter);

    res.json({
      units,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách phòng', error: error.message });
  }
};

// [Admin] Chi tiết phòng
exports.getUnitDetails = async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId).populate('landlord currentTenant', 'fullName email phone');
    if (!unit) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    // Kiểm tra quyền
    if (unit.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem phòng này' });
    }

    res.json(unit);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết phòng', error: error.message });
  }
};

// [Admin] Cập nhật thông tin phòng
exports.updateUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { 
      unitNumber, 
      building, 
      floor, 
      squareMeters, 
      roomType, 
      rentPrice, 
      depositAmount, 
      amenities, 
      description, 
      images, 
      status,
      currentTenant 
    } = req.body;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    if (unit.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật phòng này' });
    }

    // Update all editable fields
    if (unitNumber) unit.unitNumber = unitNumber;
    if (building) unit.building = building;
    if (floor !== undefined) unit.floor = floor;
    if (squareMeters) unit.squareMeters = squareMeters;
    if (roomType && ['studio', 'one-bedroom', 'two-bedroom', 'three-bedroom'].includes(roomType)) {
      unit.roomType = roomType;
    }
    if (rentPrice !== undefined) unit.rentPrice = rentPrice;
    if (depositAmount !== undefined) unit.depositAmount = depositAmount;
    if (amenities) unit.amenities = amenities;
    if (description !== undefined) unit.description = description;
    if (images) unit.images = images;
    if (status && ['available', 'occupied', 'maintenance', 'rented-out'].includes(status)) {
      unit.status = status;
    }
    if (currentTenant !== undefined) {
      unit.currentTenant = currentTenant || null;
    }

    await unit.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'UPDATE_UNIT',
      targetType: 'Unit',
      targetId: unit._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Cập nhật thông tin phòng ${unit.unitNumber}`
    });

    // Populate relations before returning
    await unit.populate('landlord', 'fullName email');
    if (unit.currentTenant) {
      await unit.populate('currentTenant', 'fullName email phone');
    }

    res.json({
      message: 'Cập nhật phòng thành công',
      unit
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật phòng', error: error.message });
  }
};

// [Admin] Xóa phòng (soft delete - đặt status = maintenance)
exports.deleteUnit = async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    if (unit.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa phòng này' });
    }

    if (unit.currentTenant) {
      return res.status(400).json({ message: 'Không thể xóa phòng đang có khách thuê' });
    }

    unit.status = 'maintenance';
    await unit.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'DELETE_UNIT',
      targetType: 'Unit',
      targetId: unit._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Xóa phòng ${unit.unitNumber}`
    });

    res.json({
      message: 'Phòng được xóa thành công',
      unit
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa phòng', error: error.message });
  }
};

// [Admin] Gửi danh sách phòng trống cho khách hiện tại (để giới thiệu bạn bè)
exports.getAvailableUnitsForListing = async (req, res) => {
  try {
    const { building } = req.query;

    const filter = {
      landlord: req.user.id,
      status: 'available'
    };

    if (building) filter.building = building;

    const units = await Unit.find(filter)
      .select('unitNumber building floor roomType rentPrice squareMeters amenities images')
      .sort({ building: 1, floor: 1 });

    res.json({
      message: 'Danh sách phòng trống',
      units,
      count: units.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách phòng trống', error: error.message });
  }
};

// [Tenant] Xem chi tiết phòng mình đang thuê
exports.getTenantUnitDetails = async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId).populate('landlord', 'fullName email phone');
    if (!unit) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    // Kiểm tra khách hàng có đang thuê phòng này không
    if (!unit.currentTenant || unit.currentTenant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem phòng này' });
    }

    res.json({
      unit: {
        unitNumber: unit.unitNumber,
        building: unit.building,
        floor: unit.floor,
        roomType: unit.roomType,
        squareMeters: unit.squareMeters,
        rentPrice: unit.rentPrice,
        amenities: unit.amenities,
        images: unit.images,
        landlord: unit.landlord
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết phòng', error: error.message });
  }
};

module.exports = exports;
