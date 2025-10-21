const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
      // User who receives notification
    },
    notificationType: {
      type: String,
      enum: ['invoice-issued', 'payment-due', 'payment-received', 'maintenance-assigned', 'maintenance-completed', 'contract-expiring', 'utility-reading-requested', 'message', 'system-alert', 'other'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['invoice', 'payment', 'contract', 'maintenance-ticket', 'message', 'utility-reading', 'other'],
        default: 'other'
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      }
    },
    actionUrl: {
      type: String,
      default: null
      // Deep link to view the related entity
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    sendMethod: {
      type: String,
      enum: ['in-app', 'email', 'sms', 'push-notification'],
      default: 'in-app'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    expiryDate: {
      type: Date,
      default: null
      // When notification expires and should be hidden
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

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ notificationType: 1 });
notificationSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
