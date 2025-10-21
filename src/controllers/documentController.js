const Document = require('../models/document');
const Tenant = require('../models/tenant');
const Contract = require('../models/contract');
const ActivityLog = require('../models/activityLog');

// Helper: Generate document number
const generateDocumentNumber = async (documentType) => {
  const count = await Document.countDocuments();
  return `DOC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
};

// [Tenant] Upload giấy tờ (CCCD, ảnh check-in, v.v.)
exports.uploadDocument = async (req, res) => {
  try {
    const {
      documentType,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      expiryDate,
      notes
    } = req.body;

    // Get tenant info
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    // Generate document number
    const documentNumber = await generateDocumentNumber(documentType);

    const document = new Document({
      documentNumber,
      documentType,
      tenant: tenant._id,
      unit: tenant.currentUnit,
      fileName,
      fileUrl,
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/pdf',
      expiryDate,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
      status: 'active',
      isPublic: false,
      notes
    });

    await document.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'UPLOAD_DOCUMENT',
      targetType: 'Document',
      targetId: document._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Upload tài liệu: ${documentType}`
    });

    res.status(201).json({
      message: 'Tài liệu được tải lên thành công',
      document
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải lên tài liệu', error: error.message });
  }
};

// [Admin] Xem danh sách tài liệu (có filter theo type, status)
exports.listDocuments = async (req, res) => {
  try {
    const { documentType, status, building, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (documentType) filter.documentType = documentType;
    if (status) filter.status = status;

    let documents = await Document.find(filter)
      .populate('unit', 'unitNumber building')
      .populate('tenant', 'identityCard')
      .populate('uploadedBy', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ uploadedAt: -1 });

    if (building) {
      documents = documents.filter(d => d.unit?.building === building);
    }

    const total = await Document.countDocuments(filter);

    res.json({
      documents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách tài liệu', error: error.message });
  }
};

// [Admin] Chi tiết tài liệu
exports.getDocumentDetails = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId)
      .populate('unit')
      .populate('tenant')
      .populate('uploadedBy', 'fullName email');

    if (!document) {
      return res.status(404).json({ message: 'Tài liệu không tồn tại' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết tài liệu', error: error.message });
  }
};

// [Admin] Lưu tài liệu (lưu ảnh check-in, bill, v.v., lưu khoảng 3 tháng)
exports.archiveDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Tài liệu không tồn tại' });
    }

    // Archive document (mark as archived but keep for audit trail)
    document.status = 'archived';
    await document.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'ARCHIVE_DOCUMENT',
      targetType: 'Document',
      targetId: document._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Lưu trữ tài liệu ${document.documentNumber}`
    });

    res.json({
      message: 'Tài liệu được lưu trữ thành công',
      document
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lưu trữ tài liệu', error: error.message });
  }
};

// [Admin] Xóa tài liệu
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Tài liệu không tồn tại' });
    }

    // Hard delete or soft delete?
    await Document.findByIdAndDelete(documentId);

    await ActivityLog.create({
      user: req.user.id,
      action: 'DELETE_DOCUMENT',
      targetType: 'Document',
      targetId: documentId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Xóa tài liệu ${document.documentNumber}`
    });

    res.json({
      message: 'Tài liệu được xóa thành công'
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa tài liệu', error: error.message });
  }
};

// [Tenant] Xem danh sách tài liệu của mình
exports.getTenantDocuments = async (req, res) => {
  try {
    const { documentType } = req.query;

    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      return res.status(404).json({ message: 'Bạn chưa có hồ sơ khách thuê' });
    }

    const filter = {
      tenant: tenant._id,
      status: { $ne: 'expired' }
    };

    if (documentType) filter.documentType = documentType;

    const documents = await Document.find(filter)
      .sort({ uploadedAt: -1 });

    res.json({
      documents,
      count: documents.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách tài liệu', error: error.message });
  }
};

// [Tenant] Download tài liệu
exports.downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Tài liệu không tồn tại' });
    }

    // Check if tenant owns this document
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant || document.tenant.toString() !== tenant._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền tải tài liệu này' });
    }

    // In real scenario, redirect to file storage
    res.json({
      message: 'Tài liệu sẵn sàng để tải',
      document: {
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        mimeType: document.mimeType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải tài liệu', error: error.message });
  }
};

// [Admin] Gửi tài liệu cho khách (công khai hóa đơn, receipt, v.v.)
exports.shareDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Tài liệu không tồn tại' });
    }

    document.isPublic = true;
    await document.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'SHARE_DOCUMENT',
      targetType: 'Document',
      targetId: document._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Chia sẻ tài liệu ${document.documentNumber} cho khách thuê`
    });

    res.json({
      message: 'Tài liệu được chia sẻ thành công',
      document
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi chia sẻ tài liệu', error: error.message });
  }
};

module.exports = exports;
