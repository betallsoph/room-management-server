const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CHANGE_ROLE', 'TOGGLE_STATUS', 'ASSIGN', 'RESOLVE'],
      required: true
    },
    targetType: {
      type: String,
      enum: ['USER', 'ROOM', 'BOOKING', 'TENANT', 'INVOICE', 'MAINTENANCE_TICKET', 'CONTRACT', 'UNIT'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    details: {
      type: Object,
      default: {}
    },
    ipAddress: {
      type: String,
      required: false
    },
    userAgent: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
