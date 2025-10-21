const Message = require('../models/message');
const Tenant = require('../models/tenant');
const Contract = require('../models/contract');
const ActivityLog = require('../models/activityLog');
const Notification = require('../models/notification');

// Helper: Generate conversation ID (unit_<unitId> or contract_<contractId>)
const generateConversationId = (unit, contract) => {
  if (unit) return `unit_${unit}`;
  if (contract) return `contract_${contract}`;
  return null;
};

// [Tenant/Admin] Gửi tin nhắn cho chủ nhà (chat riêng biệt)
exports.sendMessage = async (req, res) => {
  try {
    const {
      recipient,
      content,
      messageType,
      attachments,
      unit,
      contract
    } = req.body;

    // Generate conversation ID
    const conversationId = generateConversationId(unit, contract);

    const message = new Message({
      conversationId,
      sender: req.user.id,
      recipient,
      content,
      messageType: messageType || 'text',
      attachments: attachments || [],
      unit: unit || null,
      contract: contract || null,
      status: 'sent',
      isRead: false,
      createdAt: new Date()
    });

    await message.save();

    // Notification to recipient
    await Notification.create({
      recipient,
      notificationType: 'message',
      title: 'Bạn có tin nhắn mới',
      message: content.substring(0, 100),
      relatedEntity: {
        entityType: 'message',
        entityId: message._id
      },
      sendMethod: 'in-app'
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'SEND_MESSAGE',
      targetType: 'Message',
      targetId: message._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Gửi tin nhắn ${messageType}`
    });

    res.status(201).json({
      message: 'Tin nhắn được gửi thành công',
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi tin nhắn', error: error.message });
  }
};

// [Tenant/Admin] Xem đoạn chat (lấy danh sách tin nhắn trong conversation)
exports.getConversationHistory = async (req, res) => {
  try {
    const { conversationId, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'fullName email')
      .populate('recipient', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Message.countDocuments({ conversationId });

    // Mark all messages as read for current user
    await Message.updateMany(
      {
        conversationId,
        recipient: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      messages: messages.reverse(),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử chat', error: error.message });
  }
};

// [Tenant/Admin] Danh sách các conversation (những người đã chat)
exports.listConversations = async (req, res) => {
  try {
    // Get all unique conversation IDs where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    })
      .populate('sender', 'fullName email phone')
      .populate('recipient', 'fullName email phone')
      .sort({ createdAt: -1 });

    // Group by conversation partner (for sender/recipient)
    const conversations = {};
    const conversationList = [];

    for (const msg of messages) {
      const partner = msg.sender.toString() === req.user.id ? msg.recipient : msg.sender;
      const key = partner._id.toString();

      if (!conversations[key]) {
        conversations[key] = {
          partnerId: partner._id,
          partnerName: partner.fullName,
          partnerEmail: partner.email,
          partnerPhone: partner.phone,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: msg.recipient.toString() === req.user.id && !msg.isRead ? 1 : 0,
          conversationId: msg.conversationId,
          unit: msg.unit,
          contract: msg.contract
        };
        conversationList.push(conversations[key]);
      } else {
        if (msg.recipient.toString() === req.user.id && !msg.isRead) {
          conversations[key].unreadCount++;
        }
      }
    }

    res.json({
      conversations: conversationList,
      count: conversationList.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách conversation', error: error.message });
  }
};

// [Tenant/Admin] Chi tiết tin nhắn
exports.getMessageDetails = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId)
      .populate('sender', 'fullName email')
      .populate('recipient', 'fullName email');

    if (!message) {
      return res.status(404).json({ message: 'Tin nhắn không tồn tại' });
    }

    // Check if user is sender or recipient
    if (message.sender.toString() !== req.user.id && message.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem tin nhắn này' });
    }

    // Mark as read
    if (message.recipient.toString() === req.user.id) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết tin nhắn', error: error.message });
  }
};

// [Tenant/Admin] Chỉnh sửa tin nhắn
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Tin nhắn không tồn tại' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa tin nhắn này' });
    }

    // Keep edit history
    message.editHistory.push({
      previousContent: message.content,
      editedAt: new Date()
    });

    message.content = content;
    message.editedAt = new Date();

    await message.save();

    res.json({
      message: 'Chỉnh sửa tin nhắn thành công',
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi chỉnh sửa tin nhắn', error: error.message });
  }
};

// [Tenant/Admin] Xóa tin nhắn
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Tin nhắn không tồn tại' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa tin nhắn này' });
    }

    await Message.findByIdAndDelete(messageId);

    await ActivityLog.create({
      user: req.user.id,
      action: 'DELETE_MESSAGE',
      targetType: 'Message',
      targetId: messageId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: 'Xóa tin nhắn'
    });

    res.json({
      message: 'Xóa tin nhắn thành công'
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa tin nhắn', error: error.message });
  }
};

// [Tenant/Admin] Xem số tin nhắn chưa đọc
exports.getUnreadMessageCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy số tin nhắn chưa đọc', error: error.message });
  }
};

// [Tenant/Admin] Gửi attachment (file, ảnh)
exports.uploadAttachment = async (req, res) => {
  try {
    const {
      messageId,
      fileName,
      fileUrl,
      fileSize,
      mimeType
    } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Tin nhắn không tồn tại' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm attachment vào tin nhắn này' });
    }

    message.attachments.push({
      fileName,
      fileUrl,
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/octet-stream',
      uploadedAt: new Date()
    });

    await message.save();

    res.json({
      message: 'Tải attachment thành công',
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải attachment', error: error.message });
  }
};

// [Admin] Xem tất cả đoạn chat cho mục đích quản lý
exports.adminViewAllMessages = async (req, res) => {
  try {
    const { unit, contract, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (unit) filter.unit = unit;
    if (contract) filter.contract = contract;

    const messages = await Message.find(filter)
      .populate('sender', 'fullName email')
      .populate('recipient', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Message.countDocuments(filter);

    res.json({
      messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy tin nhắn', error: error.message });
  }
};

module.exports = exports;
