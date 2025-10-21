const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true
      // Format: "unit_<unitId>" or "contract_<contractId>"
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null
      // Optional: link message to specific unit
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      default: null
      // Optional: link message to specific contract
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    content: {
      type: String,
      required: true
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    },
    editedAt: {
      type: Date,
      default: null
    },
    editHistory: [
      {
        previousContent: String,
        editedAt: Date
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ conversationId: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1 });
messageSchema.index({ unit: 1 });
messageSchema.index({ contract: 1 });
messageSchema.index({ createdAt: 1 });
messageSchema.index({ isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
