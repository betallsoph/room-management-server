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
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CHANGE_ROLE', 'TOGGLE_STATUS'],
      required: true
    },
    targetType: {
      type: String,
      enum: ['USER', 'ROOM', 'BOOKING'],
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
