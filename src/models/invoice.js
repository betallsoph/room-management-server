const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
      // Format: "INV-2025-01-A101"
    },
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
    rentAmount: {
      type: Number,
      required: true,
      default: 0
    },
    utilities: {
      electricity: {
        reading: Number,
        cost: {
          type: Number,
          default: 0
        }
      },
      water: {
        reading: Number,
        cost: {
          type: Number,
          default: 0
        }
      },
      internet: {
        cost: {
          type: Number,
          default: 0
        }
      },
      other: {
        type: Number,
        default: 0
      }
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'issued', 'paid', 'overdue'],
      default: 'issued'
    },
    issuedDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidDate: {
      type: Date,
      default: null
    },
    paidAmount: {
      type: Number,
      default: 0
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

invoiceSchema.index({ contract: 1 });
invoiceSchema.index({ tenant: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
