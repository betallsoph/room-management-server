const mongoose = require('mongoose');

const utilityReadingSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true
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
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    electricity: {
      previousReading: {
        type: Number,
        default: 0
      },
      currentReading: {
        type: Number,
        required: true,
        min: 0
      },
      usage: {
        type: Number,
        default: 0
        // Calculated from currentReading - previousReading
      },
      unitPrice: {
        type: Number,
        default: 0
        // Đơn giá điện (VND per kWh)
      },
      totalCost: {
        type: Number,
        default: 0
        // Calculated from usage * unitPrice
      }
    },
    water: {
      previousReading: {
        type: Number,
        default: 0
      },
      currentReading: {
        type: Number,
        required: true,
        min: 0
      },
      usage: {
        type: Number,
        default: 0
        // Calculated from currentReading - previousReading
      },
      unitPrice: {
        type: Number,
        default: 0
        // Đơn giá nước (VND per m3)
      },
      totalCost: {
        type: Number,
        default: 0
        // Calculated from usage * unitPrice
      }
    },
    status: {
      type: String,
      enum: ['submitted', 'verified', 'rejected'],
      default: 'submitted'
    },
    submittedDate: {
      type: Date,
      default: Date.now
    },
    verifiedDate: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
      // Admin/Landlord who verified the reading
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

utilityReadingSchema.index({ contract: 1 });
utilityReadingSchema.index({ unit: 1 });
utilityReadingSchema.index({ tenant: 1 });
utilityReadingSchema.index({ year: 1, month: 1 });
utilityReadingSchema.index({ status: 1 });

module.exports = mongoose.model('UtilityReading', utilityReadingSchema);
