const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true
      // Format: "HD-2025-001"
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    rentAmount: {
      type: Number,
      required: true,
      min: 0
    },
    depositAmount: {
      type: Number,
      required: true,
      min: 0
    },
    utilities: {
      electricity: {
        type: Boolean,
        default: true
        // Tiền điện có tính vào HĐ không
      },
      water: {
        type: Boolean,
        default: true
      },
      internet: {
        type: Boolean,
        default: false
      },
      other: [String]
    },
    terms: {
      type: String,
      default: ''
      // Các điều khoản khác
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'expired', 'terminated'],
      default: 'active'
    },
    signedDate: {
      type: Date,
      default: null
    },
    documents: [
      {
        type: String
        // URL file hợp đồng PDF
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

contractSchema.index({ unit: 1 });
contractSchema.index({ tenant: 1 });
contractSchema.index({ landlord: 1 });
contractSchema.index({ status: 1 });

module.exports = mongoose.model('Contract', contractSchema);
