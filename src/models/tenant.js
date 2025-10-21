const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    identityCard: {
      type: String,
      required: true,
      unique: true
      // CMND/CCCD
    },
    phone: {
      type: String,
      required: true
    },
    emergencyContact: {
      name: String,
      phone: String
    },
    currentUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null
    },
    moveInDate: {
      type: Date,
      default: null
    },
    moveOutDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'moved-out'],
      default: 'active'
    },
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

tenantSchema.index({ userId: 1 });
tenantSchema.index({ currentUnit: 1 });

module.exports = mongoose.model('Tenant', tenantSchema);
