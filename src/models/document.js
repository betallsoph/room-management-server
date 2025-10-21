const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    documentNumber: {
      type: String,
      required: true,
      unique: true
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      default: null
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null
    },
    documentType: {
      type: String,
      enum: ['contract', 'invoice', 'payment-receipt', 'id-card', 'tenant-profile', 'utility-bill', 'maintenance-report', 'other'],
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
      // URL to file in cloud storage (S3, GCS, etc)
    },
    fileSize: {
      type: Number,
      default: 0
      // Size in bytes
    },
    mimeType: {
      type: String,
      default: 'application/pdf'
    },
    isPublic: {
      type: Boolean,
      default: false
      // Accessible by both tenant and landlord
    },
    expiryDate: {
      type: Date,
      default: null
      // Documents like ID cards may expire
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'expired'],
      default: 'active'
    },
    notes: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

documentSchema.index({ contract: 1 });
documentSchema.index({ unit: 1 });
documentSchema.index({ tenant: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ status: 1 });

module.exports = mongoose.model('Document', documentSchema);
