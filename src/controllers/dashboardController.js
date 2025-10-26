const Unit = require('../models/unit');
const Tenant = require('../models/tenant');
const Contract = require('../models/contract');
const Invoice = require('../models/invoice');
const Payment = require('../models/payment');
const MaintenanceTicket = require('../models/maintenanceTicket');
const UtilityReading = require('../models/utilityReading');

// [Admin] Lấy thống kê tổng quan cho dashboard
exports.getDashboardStatistics = async (req, res) => {
  try {
    // Đếm tổng số phòng theo trạng thái
    const totalUnits = await Unit.countDocuments();
    const availableUnits = await Unit.countDocuments({ status: 'available' });
    const occupiedUnits = await Unit.countDocuments({ status: 'occupied' });
    const maintenanceUnits = await Unit.countDocuments({ status: 'maintenance' });

    // Đếm tổng số khách thuê theo trạng thái
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ status: 'active' });
    const inactiveTenants = await Tenant.countDocuments({ status: 'inactive' });

    // Đếm hợp đồng
    const totalContracts = await Contract.countDocuments();
    const activeContracts = await Contract.countDocuments({ status: 'active' });
    const expiringSoonContracts = await Contract.countDocuments({
      status: 'active',
      endDate: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ngày tới
      }
    });

    // Thống kê hóa đơn
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const unpaidInvoices = await Invoice.countDocuments({ status: 'pending' });
    const overdueInvoices = await Invoice.countDocuments({ 
      status: 'pending',
      dueDate: { $lt: new Date() }
    });

    // Tính doanh thu tháng này
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Tính tổng doanh thu
    const totalRevenue = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Đếm maintenance tickets
    const totalTickets = await MaintenanceTicket.countDocuments();
    const newTickets = await MaintenanceTicket.countDocuments({ status: 'new' });
    const assignedTickets = await MaintenanceTicket.countDocuments({ status: 'assigned' });
    const inProgressTickets = await MaintenanceTicket.countDocuments({ status: 'in-progress' });
    const completedTickets = await MaintenanceTicket.countDocuments({ status: 'completed' });
    const rejectedTickets = await MaintenanceTicket.countDocuments({ status: 'rejected' });

    // Đếm utility readings chưa xác nhận
    const pendingReadings = await UtilityReading.countDocuments({ status: 'pending' });

    // Thống kê doanh thu 6 tháng gần nhất
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      message: 'Thống kê dashboard',
      statistics: {
        units: {
          total: totalUnits,
          available: availableUnits,
          occupied: occupiedUnits,
          maintenance: maintenanceUnits,
          occupancyRate: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0
        },
        tenants: {
          total: totalTenants,
          active: activeTenants,
          inactive: inactiveTenants
        },
        contracts: {
          total: totalContracts,
          active: activeContracts,
          expiringSoon: expiringSoonContracts
        },
        invoices: {
          total: totalInvoices,
          paid: paidInvoices,
          unpaid: unpaidInvoices,
          overdue: overdueInvoices
        },
        revenue: {
          monthly: monthlyRevenue[0]?.total || 0,
          total: totalRevenue[0]?.total || 0,
          byMonth: revenueByMonth
        },
        maintenanceTickets: {
          total: totalTickets,
          new: newTickets,
          assigned: assignedTickets,
          inProgress: inProgressTickets,
          completed: completedTickets,
          rejected: rejectedTickets
        },
        utilityReadings: {
          pendingApproval: pendingReadings
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi lấy thống kê dashboard', 
      error: error.message 
    });
  }
};

// [Admin] Lấy hoạt động gần đây
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Lấy các activities gần nhất từ nhiều nguồn
    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('invoiceId', 'invoiceNumber')
      .populate('paidBy', 'fullName email')
      .lean();

    const recentTickets = await MaintenanceTicket.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('unitId', 'unitNumber')
      .populate('reportedBy', 'fullName')
      .lean();

    const recentContracts = await Contract.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('unitId', 'unitNumber')
      .populate('tenantId', 'fullName')
      .lean();

    // Combine và sort theo thời gian
    const activities = [];

    recentPayments.forEach(payment => {
      activities.push({
        type: 'payment',
        title: `Thanh toán ${payment.amount.toLocaleString('vi-VN')}đ`,
        description: `Hóa đơn ${payment.invoiceId?.invoiceNumber || 'N/A'}`,
        user: payment.paidBy?.fullName || 'Unknown',
        timestamp: payment.createdAt,
        status: payment.status
      });
    });

    recentTickets.forEach(ticket => {
      activities.push({
        type: 'maintenance',
        title: `Yêu cầu bảo trì: ${ticket.title}`,
        description: `Phòng ${ticket.unitId?.unitNumber || 'N/A'}`,
        user: ticket.reportedBy?.fullName || 'Unknown',
        timestamp: ticket.createdAt,
        status: ticket.status,
        priority: ticket.priority
      });
    });

    recentContracts.forEach(contract => {
      activities.push({
        type: 'contract',
        title: `Hợp đồng mới: ${contract.unitId?.unitNumber || 'N/A'}`,
        description: `Khách thuê: ${contract.tenantId?.fullName || 'Unknown'}`,
        user: 'Admin',
        timestamp: contract.createdAt,
        status: contract.status
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      message: 'Hoạt động gần đây',
      activities: activities.slice(0, limit),
      total: activities.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi lấy hoạt động gần đây', 
      error: error.message 
    });
  }
};

module.exports = exports;
