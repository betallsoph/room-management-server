const Payment = require('../models/payment');
const Invoice = require('../models/invoice');
const ActivityLog = require('../models/activityLog');
const Notification = require('../models/notification');

// Helper: Generate payment number
const generatePaymentNumber = async () => {
  const count = await Payment.countDocuments();
  return `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
};

// [Admin] Ghi nhận thanh toán từ khách
exports.recordPayment = async (req, res) => {
  try {
    const {
      invoice,
      tenant,
      amount,
      paymentMethod,
      transactionId,
      paymentDate,
      notes
    } = req.body;

    // Kiểm tra invoice tồn tại
    const invoiceDoc = await Invoice.findById(invoice);
    if (!invoiceDoc) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
    }

    // Generate payment number
    const paymentNumber = await generatePaymentNumber();

    const payment = new Payment({
      paymentNumber,
      invoice,
      tenant,
      amount,
      paymentMethod,
      transactionId: transactionId || '',
      status: 'success',
      paymentDate: paymentDate || new Date(),
      notes
    });

    await payment.save();

    // Cập nhật hóa đơn
    invoiceDoc.paidAmount = (invoiceDoc.paidAmount || 0) + amount;
    invoiceDoc.paidDate = paymentDate || new Date();

    if (invoiceDoc.paidAmount >= invoiceDoc.totalAmount) {
      invoiceDoc.status = 'paid';
    } else if (invoiceDoc.paidAmount > 0) {
      invoiceDoc.status = 'partial';
    }

    await invoiceDoc.save();

    // Notification to tenant
    await Notification.create({
      recipient: tenant,
      notificationType: 'payment-received',
      title: 'Thanh toán được xác nhận',
      message: `Thanh toán ${amount.toLocaleString('vi-VN')} VND cho hóa đơn tháng ${invoiceDoc.month}/${invoiceDoc.year} đã được ghi nhận`,
      relatedEntity: {
        entityType: 'payment',
        entityId: payment._id
      },
      sendMethod: 'in-app'
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'RECORD_PAYMENT',
      targetType: 'Payment',
      targetId: payment._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Ghi nhận thanh toán ${paymentNumber}`
    });

    res.status(201).json({
      message: 'Thanh toán được ghi nhận thành công',
      payment,
      invoiceStatus: invoiceDoc.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi ghi nhận thanh toán', error: error.message });
  }
};

// [Admin] Xem danh sách thanh toán (có filter theo status, method)
exports.listPayments = async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    // Date range filter
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('invoice', 'invoiceNumber month year totalAmount')
      .populate('tenant', 'identityCard')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ paymentDate: -1 });

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách thanh toán', error: error.message });
  }
};

// [Admin] Chi tiết thanh toán
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('invoice')
      .populate('tenant', 'identityCard phone');

    if (!payment) {
      return res.status(404).json({ message: 'Thanh toán không tồn tại' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết thanh toán', error: error.message });
  }
};

// [Admin] Theo dõi trạng thái thanh toán (Đã hoàn thành, còn thiếu, chưa chuyển khoản, nợ sang tháng sau)
exports.getPaymentStatus = async (req, res) => {
  try {
    const { building, month, year } = req.query;

    // Find all invoices for the period
    let invoices = await Invoice.find()
      .populate('unit', 'unitNumber building')
      .populate('tenant', 'identityCard');

    if (month) invoices = invoices.filter(inv => inv.month === parseInt(month));
    if (year) invoices = invoices.filter(inv => inv.year === parseInt(year));
    if (building) invoices = invoices.filter(inv => inv.unit?.building === building);

    // Categorize by payment status
    const statusSummary = {
      paid: invoices.filter(inv => inv.status === 'paid'),
      partial: invoices.filter(inv => inv.status === 'partial'),
      unpaid: invoices.filter(inv => inv.status === 'issued'),
      overdue: invoices.filter(inv => inv.status === 'overdue'),
      missing: invoices.filter(inv => inv.status === 'missing')
    };

    // Calculate totals
    const totals = {
      paid: statusSummary.paid.reduce((sum, inv) => sum + inv.totalAmount, 0),
      partial: statusSummary.partial.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0),
      unpaid: statusSummary.unpaid.reduce((sum, inv) => sum + inv.totalAmount, 0),
      overdue: statusSummary.overdue.reduce((sum, inv) => sum + inv.totalAmount, 0),
      missing: statusSummary.missing.reduce((sum, inv) => sum + inv.totalAmount, 0)
    };

    res.json({
      summary: {
        paid: {
          count: statusSummary.paid.length,
          total: totals.paid
        },
        partial: {
          count: statusSummary.partial.length,
          total: totals.partial
        },
        unpaid: {
          count: statusSummary.unpaid.length,
          total: totals.unpaid
        },
        overdue: {
          count: statusSummary.overdue.length,
          total: totals.overdue
        },
        missing: {
          count: statusSummary.missing.length,
          total: totals.missing
        }
      },
      details: statusSummary
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy trạng thái thanh toán', error: error.message });
  }
};

// [Admin] Gửi thông tin ngân hàng/MoMo cho khách
exports.sendPaymentInfo = async (req, res) => {
  try {
    const { invoice, bankInfo, momoInfo } = req.body;

    const invoiceDoc = await Invoice.findById(invoice);
    if (!invoiceDoc) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
    }

    // Create notification with payment info
    const paymentInfoMessage = `
    Thông tin thanh toán cho hóa đơn tháng ${invoiceDoc.month}/${invoiceDoc.year}:
    Số tiền: ${invoiceDoc.totalAmount.toLocaleString('vi-VN')} VND
    ${bankInfo ? `Chuyển khoản ngân hàng: ${bankInfo}` : ''}
    ${momoInfo ? `MoMo: ${momoInfo}` : ''}
    `;

    await Notification.create({
      recipient: invoiceDoc.tenant,
      notificationType: 'payment-due',
      title: 'Thông tin thanh toán',
      message: paymentInfoMessage,
      relatedEntity: {
        entityType: 'invoice',
        entityId: invoice
      },
      sendMethod: 'in-app'
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'SEND_PAYMENT_INFO',
      targetType: 'Invoice',
      targetId: invoice,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Gửi thông tin thanh toán cho hóa đơn ${invoiceDoc.invoiceNumber}`
    });

    res.json({
      message: 'Thông tin thanh toán được gửi thành công',
      notificationSent: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi thông tin thanh toán', error: error.message });
  }
};

// [Tenant] Xem lịch sử thanh toán của mình
exports.getTenantPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find tenant
    const Tenant = require('../models/tenant');
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    const payments = await Payment.find({ tenant: tenant._id })
      .populate('invoice', 'invoiceNumber month year totalAmount')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ paymentDate: -1 });

    const total = await Payment.countDocuments({ tenant: tenant._id });

    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử thanh toán', error: error.message });
  }
};

module.exports = exports;
