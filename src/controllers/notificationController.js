const Notification = require('../models/notification');
const ActivityLog = require('../models/activityLog');

// [Admin] Tạo & gửi thông báo cho khách (có thể gửi theo block, toà nhà, phòng, khách riêng)
exports.sendNotification = async (req, res) => {
  try {
    const {
      recipients,
      notificationType,
      title,
      message,
      actionUrl,
      sendMethod,
      recipientFilter
    } = req.body;

    // Nếu có filter, tìm recipients dựa trên filter
    let targetRecipients = recipients || [];

    if (recipientFilter) {
      const Unit = require('../models/unit');
      const Tenant = require('../models/tenant');

      if (recipientFilter.building) {
        // Gửi cho tất cả khách ở toà nhà này
        const units = await Unit.find({ building: recipientFilter.building });
        const tenants = await Tenant.find({ currentUnit: { $in: units.map(u => u._id) } });
        targetRecipients = tenants.map(t => t.userId);
      } else if (recipientFilter.unit) {
        // Gửi cho khách ở phòng này
        const tenant = await Tenant.findOne({ currentUnit: recipientFilter.unit });
        if (tenant) targetRecipients = [tenant.userId];
      } else if (recipientFilter.block) {
        // Gửi cho tất cả khách ở block này
        const units = await Unit.find({ building: { $regex: `^${recipientFilter.block}` } });
        const tenants = await Tenant.find({ currentUnit: { $in: units.map(u => u._id) } });
        targetRecipients = tenants.map(t => t.userId);
      }
    }

    if (targetRecipients.length === 0) {
      return res.status(400).json({ message: 'Không có người nhận nào' });
    }

    // Create notifications for each recipient
    const notifications = await Notification.insertMany(
      targetRecipients.map(recipientId => ({
        recipient: recipientId,
        notificationType: notificationType || 'system-alert',
        title,
        message,
        actionUrl: actionUrl || null,
        sendMethod: sendMethod || 'in-app',
        deliveryStatus: 'sent',
        sentAt: new Date()
      }))
    );

    await ActivityLog.create({
      user: req.user.id,
      action: 'SEND_NOTIFICATION',
      targetType: 'Notification',
      targetId: notifications[0]?._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Gửi thông báo cho ${targetRecipients.length} người nhận`
    });

    res.status(201).json({
      message: `Gửi thông báo cho ${targetRecipients.length} người nhận thành công`,
      notificationCount: notifications.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi thông báo', error: error.message });
  }
};

// [Admin] Xem danh sách thông báo đã gửi
exports.listSentNotifications = async (req, res) => {
  try {
    const { notificationType, deliveryStatus, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (notificationType) filter.notificationType = notificationType;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;

    const notifications = await Notification.find(filter)
      .populate('recipient', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ sentAt: -1 });

    const total = await Notification.countDocuments(filter);

    res.json({
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách thông báo', error: error.message });
  }
};

// [Tenant] Xem thông báo của mình (phân biệt thông báo quan trọng/bình thường)
exports.getTenantNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const skip = (page - 1) * limit;

    const filter = { recipient: req.user.id };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    // Separate important from regular
    const importantNotifications = notifications.filter(n => 
      ['payment-due', 'payment-received', 'invoice-issued', 'system-alert'].includes(n.notificationType)
    );
    const regularNotifications = notifications.filter(n => 
      !['payment-due', 'payment-received', 'invoice-issued', 'system-alert'].includes(n.notificationType)
    );

    res.json({
      important: importantNotifications,
      regular: regularNotifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông báo', error: error.message });
  }
};

// [Tenant] Đánh dấu thông báo là đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Thông báo không tồn tại' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền đánh dấu thông báo này' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      message: 'Đánh dấu thông báo là đã đọc',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đánh dấu thông báo', error: error.message });
  }
};

// [Tenant] Đánh dấu tất cả thông báo là đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      message: 'Đánh dấu tất cả thông báo là đã đọc',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đánh dấu thông báo', error: error.message });
  }
};

// [Tenant] Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Thông báo không tồn tại' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa thông báo này' });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.json({
      message: 'Xóa thông báo thành công'
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa thông báo', error: error.message });
  }
};

// [Tenant] Xem thông báo chi tiết (để click vào xem thông tin liên quan)
exports.getNotificationDetails = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Thông báo không tồn tại' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem thông báo này' });
    }

    // Mark as read
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    // If notification has a related entity, fetch it
    let relatedData = null;
    if (notification.relatedEntity?.entityId) {
      switch (notification.relatedEntity.entityType) {
        case 'invoice':
          const Invoice = require('../models/invoice');
          relatedData = await Invoice.findById(notification.relatedEntity.entityId);
          break;
        case 'payment':
          const Payment = require('../models/payment');
          relatedData = await Payment.findById(notification.relatedEntity.entityId);
          break;
        case 'maintenance-ticket':
          const MaintenanceTicket = require('../models/maintenanceTicket');
          relatedData = await MaintenanceTicket.findById(notification.relatedEntity.entityId);
          break;
        case 'utility-reading':
          const UtilityReading = require('../models/utilityReading');
          relatedData = await UtilityReading.findById(notification.relatedEntity.entityId);
          break;
      }
    }

    res.json({
      notification,
      relatedData
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết thông báo', error: error.message });
  }
};

// [Admin] Xem số lượng thông báo chưa đọc
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy số thông báo chưa đọc', error: error.message });
  }
};

module.exports = exports;
