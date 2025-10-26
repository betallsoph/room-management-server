const MaintenanceTicket = require('../models/maintenanceTicket');
const Tenant = require('../models/tenant');
const Contract = require('../models/contract');
const ActivityLog = require('../models/activityLog');
const Notification = require('../models/notification');

// [Tenant] Báo cáo sự cố
exports.createMaintenanceTicket = async (req, res) => {
  try {
    const {
      category,
      priority,
      title,
      description,
      images
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

    // Generate ticket number
    const ticketCount = await MaintenanceTicket.countDocuments();
    const ticketNumber = `TK-${new Date().getFullYear()}-${String(ticketCount + 1).padStart(5, '0')}`;

    const ticket = new MaintenanceTicket({
      ticketNumber,
      unit: tenant.currentUnit,
      contract: contract._id,
      tenant: tenant._id,
      category,
      priority: priority || 'medium',
      title,
      description,
      images: images || [],
      status: 'new',
      createdBy: req.user.id
    });

    await ticket.save();

    // Tạo notification cho chủ nhà (nếu có)
    try {
      if (contract.landlord) {
        await Notification.create({
          recipient: contract.landlord,
          notificationType: 'maintenance-assigned',
          title: `Báo cáo sự cố: ${title}`,
          message: `Khách thuê báo cáo sự cố [${priority}]: ${description.substring(0, 100)}...`,
          relatedEntity: {
            entityType: 'maintenance-ticket',
            entityId: ticket._id
          },
          actionUrl: `/maintenance-tickets/${ticket._id}`,
          sendMethod: 'in-app'
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError.message);
      // Continue even if notification fails
    }

    try {
      await ActivityLog.create({
        adminId: req.user.id,
        action: 'CREATE',
        targetType: 'MAINTENANCE_TICKET',
        targetId: ticket._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: {
          ticketNumber: ticket.ticketNumber,
          title: title,
          category: category,
          priority: priority || 'medium'
        }
      });
    } catch (logError) {
      console.error('Error creating activity log:', logError.message);
      // Continue even if activity log fails
    }

    res.status(201).json({
      message: 'Báo cáo sự cố được tạo thành công',
      ticket
    });
  } catch (error) {
    console.error('Create maintenance ticket error:', error);
    res.status(500).json({ message: 'Lỗi tạo báo cáo sự cố', error: error.message });
  }
};

// [Admin] Xem danh sách sự cố (có filter theo status, priority, building)
exports.listMaintenanceTickets = async (req, res) => {
  try {
    const { status, priority, category, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    let tickets = await MaintenanceTicket.find(filter)
      .populate('unit', 'unitNumber building floor')
      .populate({
        path: 'tenant',
        select: 'userId phone identityCard',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
      .populate({
        path: 'contract',
        select: 'contractNumber'
      })
      .populate('assignedTo', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ priority: -1, createdAt: -1 });

    // Filter by search (unit number)
    if (search) {
      tickets = tickets.filter(t => 
        t.unit?.unitNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await MaintenanceTicket.countDocuments(filter);

    // Get statistics for all tickets (not just filtered)
    const statistics = {
      total: await MaintenanceTicket.countDocuments(),
      new: await MaintenanceTicket.countDocuments({ status: 'new' }),
      assigned: await MaintenanceTicket.countDocuments({ status: 'assigned' }),
      inProgress: await MaintenanceTicket.countDocuments({ status: 'in-progress' }),
      completed: await MaintenanceTicket.countDocuments({ status: 'completed' }),
      rejected: await MaintenanceTicket.countDocuments({ status: 'rejected' })
    };

    res.json({
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      statistics
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sự cố', error: error.message });
  }
};

// [Admin] Chi tiết sự cố
exports.getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await MaintenanceTicket.findById(ticketId)
      .populate('unit', 'unitNumber building floor roomType squareMeters')
      .populate({
        path: 'contract',
        select: 'contractNumber startDate endDate'
      })
      .populate({
        path: 'tenant',
        select: 'userId phone identityCard',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
      .populate('assignedTo', 'fullName email phone')
      .populate('createdBy', 'fullName');

    if (!ticket) {
      return res.status(404).json({ message: 'Sự cố không tồn tại' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết sự cố', error: error.message });
  }
};

// [Admin] Gán sự cố cho nhân viên
exports.assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignedTo, estimatedCompletionDate } = req.body;

    const ticket = await MaintenanceTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Sự cố không tồn tại' });
    }

    ticket.assignedTo = assignedTo;
    ticket.estimatedCompletionDate = estimatedCompletionDate;
    ticket.status = 'assigned';

    await ticket.save();

    // Notification to staff
    await Notification.create({
      recipient: assignedTo,
      notificationType: 'maintenance-assigned',
      title: `Sự cố được gán cho bạn`,
      message: `Báo cáo sự cố ${ticket.title} tại phòng đã được gán cho bạn`,
      relatedEntity: {
        entityType: 'maintenance-ticket',
        entityId: ticket._id
      },
      sendMethod: 'in-app'
    });

    // Notification to tenant
    await Notification.create({
      recipient: ticket.tenant,
      notificationType: 'maintenance-assigned',
      title: `Sự cố của bạn đã được tiếp nhận`,
      message: `Báo cáo sự cố "${ticket.title}" đã được tiếp nhận. Chúng tôi sẽ xử lý trong thời gian sớm nhất`,
      relatedEntity: {
        entityType: 'maintenance-ticket',
        entityId: ticket._id
      },
      sendMethod: 'in-app'
    });

    await ActivityLog.create({
      adminId: req.user.id,
      action: 'ASSIGN',
      targetType: 'MAINTENANCE_TICKET',
      targetId: ticket._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        ticketNumber: ticket.ticketNumber,
        assignedTo: assignedTo
      }
    });

    res.json({
      message: 'Gán sự cố thành công',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gán sự cố', error: error.message });
  }
};

// [Admin/Staff] Cập nhật trạng thái sự cố
exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { 
      status, 
      notes, 
      resolutionNotes,
      cost, 
      priority, 
      category, 
      title, 
      description,
      estimatedCompletionDate 
    } = req.body;

    const ticket = await MaintenanceTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Sự cố không tồn tại' });
    }

    // Update status
    if (status && ['new', 'assigned', 'in-progress', 'completed', 'rejected'].includes(status)) {
      ticket.status = status;
    }

    // Update priority
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      ticket.priority = priority;
    }

    // Update category
    if (category && ['plumbing', 'electrical', 'structural', 'appliance', 'ventilation', 'door-lock', 'paint', 'other'].includes(category)) {
      ticket.category = category;
    }

    // Update other fields
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (notes) ticket.notes = notes;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    if (cost !== undefined) ticket.cost = cost;
    if (estimatedCompletionDate) ticket.estimatedCompletionDate = estimatedCompletionDate;

    if (status === 'completed') {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    // Notification to tenant if completed
    if (status === 'completed') {
      try {
        await Notification.create({
          recipient: ticket.tenant,
          notificationType: 'maintenance-completed',
          title: `Sự cố được xử lý xong`,
          message: `Báo cáo sự cố "${ticket.title}" đã được hoàn thành. Cảm ơn bạn đã chờ đợi!`,
          relatedEntity: {
            entityType: 'maintenance-ticket',
            entityId: ticket._id
          },
          sendMethod: 'in-app'
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError.message);
        // Continue even if notification fails
      }
    }

    try {
      await ActivityLog.create({
        adminId: req.user.id,
        action: 'UPDATE',
        targetType: 'MAINTENANCE_TICKET',
        targetId: ticket._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: {
          ticketNumber: ticket.ticketNumber,
          oldStatus: ticket.status,
          newStatus: status,
          resolutionNotes: resolutionNotes || ''
        }
      });
    } catch (logError) {
      console.error('Error creating activity log:', logError.message);
      // Continue even if activity log fails
    }

    // Populate ticket before returning
    const populatedTicket = await MaintenanceTicket.findById(ticket._id)
      .populate('unit', 'unitNumber building floor')
      .populate({
        path: 'tenant',
        select: 'userId phone identityCard',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
      .populate({
        path: 'contract',
        select: 'contractNumber'
      })
      .populate('assignedTo', 'fullName email');

    res.json({
      message: 'Cập nhật sự cố thành công',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ message: 'Lỗi cập nhật sự cố', error: error.message });
  }
};

// [Tenant] Xem danh sách sự cố của mình
exports.getTenantTickets = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    const tickets = await MaintenanceTicket.find({ tenant: tenant._id })
      .populate('unit', 'unitNumber building')
      .sort({ createdAt: -1 });

    res.json({
      tickets,
      count: tickets.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sự cố', error: error.message });
  }
};

module.exports = exports;
