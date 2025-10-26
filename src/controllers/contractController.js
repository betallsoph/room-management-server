const Contract = require('../models/contract');
const Unit = require('../models/unit');
const Tenant = require('../models/tenant');
const ActivityLog = require('../models/activityLog');
const Document = require('../models/document');

// Helper: Generate unique contract number (e.g., HĐ-2025-01-A101)
const generateContractNumber = async (building, unitNumber) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const contractCount = await Contract.countDocuments();
  return `HĐ-${year}-${month}-${building}${unitNumber}`;
};

// [Admin] Tạo hợp đồng cho khách thuê
exports.createContract = async (req, res) => {
  try {
    const {
      unit,
      tenant,
      startDate,
      endDate,
      rentAmount,
      depositAmount,
      utilities,
      terms,
      documents
    } = req.body;

    // Kiểm tra unit & tenant tồn tại
    const unitDoc = await Unit.findById(unit);
    if (!unitDoc) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    const tenantDoc = await Tenant.findById(tenant);
    if (!tenantDoc) {
      return res.status(404).json({ message: 'Khách thuê không tồn tại' });
    }

    // Kiểm tra quyền (phải là chủ phòng)
    if (unitDoc.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền tạo hợp đồng cho phòng này' });
    }

    // Tạo contract number
    const contractNumber = await generateContractNumber(unitDoc.building, unitDoc.unitNumber);

    const contract = new Contract({
      contractNumber,
      unit,
      tenant,
      landlord: req.user.id,
      startDate,
      endDate,
      rentAmount,
      depositAmount,
      utilities: utilities || {
        electricity: false,
        water: false,
        internet: false
      },
      terms: terms || [],
      documents: documents || [],
      status: 'draft'
    });

    await contract.save();

    // Update unit status to occupied
    unitDoc.currentTenant = tenant;
    unitDoc.status = 'occupied';
    await unitDoc.save();

    // Update tenant current unit
    tenantDoc.currentUnit = unit;
    tenantDoc.moveInDate = startDate;
    await tenantDoc.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'CREATE_CONTRACT',
      targetType: 'Contract',
      targetId: contract._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Tạo hợp đồng ${contractNumber}`
    });

    res.status(201).json({
      message: 'Hợp đồng được tạo thành công',
      contract
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo hợp đồng', error: error.message });
  }
};

// [Admin] Xem danh sách hợp đồng
exports.listContracts = async (req, res) => {
  try {
    const { status, building, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Admin có thể xem tất cả contracts, landlord chỉ xem của mình
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.landlord = req.user.id;
    }
    if (status) filter.status = status;

    let contracts = await Contract.find(filter)
      .populate('unit', 'unitNumber building')
      .populate({
        path: 'tenant',
        select: 'identityCard moveInDate name',
        populate: {
          path: 'userId',
          select: 'fullName email phoneNumber'
        }
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    if (building) {
      contracts = contracts.filter(c => c.unit?.building === building);
    }

    const total = await Contract.countDocuments(filter);

    res.json({
      contracts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách hợp đồng', error: error.message });
  }
};

// [Admin] Chi tiết hợp đồng
exports.getContractDetails = async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId)
      .populate('unit')
      .populate('tenant')
      .populate('landlord', 'fullName email phone');

    if (!contract) {
      return res.status(404).json({ message: 'Hợp đồng không tồn tại' });
    }

    if (contract.landlord._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem hợp đồng này' });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết hợp đồng', error: error.message });
  }
};

// [Admin] Ký hợp đồng (đánh dấu signed)
exports.signContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Hợp đồng không tồn tại' });
    }

    if (contract.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền ký hợp đồng này' });
    }

    contract.status = 'active';
    contract.signedDate = new Date();
    await contract.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'SIGN_CONTRACT',
      targetType: 'Contract',
      targetId: contract._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Ký hợp đồng ${contract.contractNumber}`
    });

    res.json({
      message: 'Hợp đồng đã được ký thành công',
      contract
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi ký hợp đồng', error: error.message });
  }
};

// [Admin] Kết thúc hợp đồng
exports.terminateContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Hợp đồng không tồn tại' });
    }

    if (contract.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền kết thúc hợp đồng này' });
    }

    contract.status = 'terminated';
    await contract.save();

    // Update unit and tenant
    await Unit.findByIdAndUpdate(contract.unit, {
      currentTenant: null,
      status: 'available'
    });

    await Tenant.findByIdAndUpdate(contract.tenant, {
      status: 'inactive',
      moveOutDate: new Date()
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'TERMINATE_CONTRACT',
      targetType: 'Contract',
      targetId: contract._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Kết thúc hợp đồng ${contract.contractNumber}`
    });

    res.json({
      message: 'Hợp đồng đã được kết thúc',
      contract
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi kết thúc hợp đồng', error: error.message });
  }
};

// [Tenant] Xem hợp đồng của mình
exports.getTenantContract = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    const contract = await Contract.findOne({
      tenant: tenant._id,
      status: { $in: ['active', 'expired'] }
    })
      .populate('unit', 'unitNumber building floor roomType rentPrice')
      .populate('landlord', 'fullName email phone');

    if (!contract) {
      return res.status(404).json({ message: 'Bạn không có hợp đồng hiệu lực' });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy hợp đồng', error: error.message });
  }
};

// [Tenant] Xem lịch sử hợp đồng (3-4 tháng gần nhất)
exports.getTenantContractHistory = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    const contracts = await Contract.find({ tenant: tenant._id })
      .populate('unit', 'unitNumber building')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      contracts,
      count: contracts.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử hợp đồng', error: error.message });
  }
};

module.exports = exports;
