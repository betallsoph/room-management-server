const Invoice = require('../models/invoice');
const Contract = require('../models/contract');
const UtilityReading = require('../models/utilityReading');
const ActivityLog = require('../models/activityLog');
const Notification = require('../models/notification');

// Helper: Generate invoice number (e.g., INV-2025-01-A101)
const generateInvoiceNumber = async (building, unitNumber, month, year) => {
  return `INV-${year}-${String(month).padStart(2, '0')}-${building}${unitNumber}`;
};

// [Admin] Tạo hóa đơn cho khách (thường được gọi tự động mỗi tháng)
exports.createInvoice = async (req, res) => {
  try {
    const {
      contract,
      unit,
      tenant,
      month,
      year,
      electricity,
      water,
      internet,
      notes
    } = req.body;

    // Kiểm tra hợp đồng tồn tại
    const contractDoc = await Contract.findById(contract);
    if (!contractDoc) {
      return res.status(404).json({ message: 'Hợp đồng không tồn tại' });
    }

    if (contractDoc.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền tạo hóa đơn cho hợp đồng này' });
    }

    // Kiểm tra đã có hóa đơn cho tháng này chưa
    const existingInvoice = await Invoice.findOne({
      contract,
      month,
      year
    });

    if (existingInvoice) {
      return res.status(400).json({ message: 'Hóa đơn cho tháng này đã tồn tại' });
    }

    // Lấy utility readings
    const utilityReading = await UtilityReading.findOne({
      contract,
      month,
      year,
      status: 'verified'
    });

    // Calculate total
    const electricityCost = electricity?.usage * electricity?.unitPrice || 0;
    const waterCost = water?.usage * water?.unitPrice || 0;
    const internetCost = internet?.cost || 0;
    const totalAmount = contractDoc.rentAmount + electricityCost + waterCost + internetCost;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(
      contractDoc.unit,
      unit,
      month,
      year
    );

    const dueDate = new Date(year, month, 10); // 10 ngày sau tháng hóa đơn

    const invoice = new Invoice({
      invoiceNumber,
      contract,
      unit,
      tenant,
      month,
      year,
      rentAmount: contractDoc.rentAmount,
      electricity: electricity || { usage: 0, unitPrice: 0, totalCost: 0 },
      water: water || { usage: 0, unitPrice: 0, totalCost: 0 },
      internet: internet || { cost: 0 },
      totalAmount,
      status: 'issued',
      issuedDate: new Date(),
      dueDate,
      notes
    });

    await invoice.save();

    // Tạo notification cho khách thuê
    await Notification.create({
      recipient: contractDoc.tenant,
      notificationType: 'invoice-issued',
      title: `Hóa đơn tháng ${month}/${year}`,
      message: `Hóa đơn của bạn cho tháng ${month}/${year} là ${totalAmount.toLocaleString('vi-VN')} VND`,
      relatedEntity: {
        entityType: 'invoice',
        entityId: invoice._id
      },
      actionUrl: `/invoices/${invoice._id}`,
      sendMethod: 'in-app'
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'CREATE_INVOICE',
      targetType: 'Invoice',
      targetId: invoice._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Tạo hóa đơn ${invoiceNumber}`
    });

    res.status(201).json({
      message: 'Hóa đơn được tạo thành công',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo hóa đơn', error: error.message });
  }
};

// [Admin] Xem danh sách hóa đơn (có filter theo status)
exports.listInvoices = async (req, res) => {
  try {
    const { status, building, month, year, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    let invoices = await Invoice.find(filter)
      .populate('contract')
      .populate('unit', 'unitNumber building')
      .populate('tenant', 'identityCard')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Filter by building từ unit
    if (building) {
      invoices = invoices.filter(inv => inv.unit?.building === building);
    }

    const total = await Invoice.countDocuments(filter);

    res.json({
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách hóa đơn', error: error.message });
  }
};

// [Admin] Chi tiết hóa đơn
exports.getInvoiceDetails = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId)
      .populate('contract')
      .populate('unit')
      .populate('tenant');

    if (!invoice) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết hóa đơn', error: error.message });
  }
};

// [Admin] Xác nhận thanh toán & đánh dấu tình trạng
exports.confirmPayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { paidAmount, paymentNotes, status } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
    }

    // Cập nhật payment info
    invoice.paidAmount = paidAmount || invoice.totalAmount;
    invoice.paidDate = new Date();
    invoice.notes = paymentNotes || '';

    // Cập nhật status
    if (status && ['paid', 'overdue', 'partial', 'missing'].includes(status)) {
      invoice.status = status;
    } else if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    // Tạo notification cho khách
    if (invoice.status === 'paid') {
      await Notification.create({
        recipient: invoice.tenant,
        notificationType: 'payment-received',
        title: `Thanh toán xác nhận`,
        message: `Chúng tôi đã nhận được thanh toán ${paidAmount.toLocaleString('vi-VN')} VND cho hóa đơn tháng ${invoice.month}/${invoice.year}`,
        relatedEntity: {
          entityType: 'invoice',
          entityId: invoice._id
        },
        sendMethod: 'in-app'
      });
    }

    await ActivityLog.create({
      user: req.user.id,
      action: 'CONFIRM_PAYMENT',
      targetType: 'Invoice',
      targetId: invoice._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Xác nhận thanh toán hóa đơn ${invoice.invoiceNumber}`
    });

    res.json({
      message: 'Xác nhận thanh toán thành công',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xác nhận thanh toán', error: error.message });
  }
};

// [Tenant] Xem danh sách hóa đơn của mình (3-4 tháng gần nhất)
exports.getTenantInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    const invoices = await Invoice.find({ tenant: tenant._id })
      .populate('contract')
      .populate('unit', 'unitNumber building')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments({ tenant: tenant._id });

    res.json({
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách hóa đơn', error: error.message });
  }
};

// [Tenant] Xem chi tiết hóa đơn
exports.getTenantInvoiceDetails = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
    }

    if (invoice.tenant.toString() !== tenant._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xem hóa đơn này' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết hóa đơn', error: error.message });
  }
};

// [Tenant] Xem lịch sử thanh toán
exports.getTenantPaymentHistory = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    const invoices = await Invoice.find({
      tenant: tenant._id,
      status: { $in: ['paid', 'partial'] }
    })
      .select('invoiceNumber month year totalAmount paidAmount paidDate status')
      .sort({ paidDate: -1 });

    res.json({
      payments: invoices,
      count: invoices.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử thanh toán', error: error.message });
  }
};

module.exports = exports;
