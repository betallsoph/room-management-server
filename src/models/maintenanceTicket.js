const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'structural', 'appliance', 'ventilation', 'door-lock', 'paint', 'other'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    images: [
      {
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: ['new', 'assigned', 'in-progress', 'completed', 'rejected'],
      default: 'new'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
      // Staff member responsible for repair
    },
    estimatedCompletionDate: {
      type: Date,
      default: null
    },
    actualCompletionDate: {
      type: Date,
      default: null
    },
    cost: {
      type: Number,
      default: 0
      // If chargeable to tenant (usually covered by landlord)
    },
    notes: {
      type: String,
      default: ''
    },
    resolutionNotes: {
      type: String,
      default: ''
      // Notes from admin when resolving the ticket
    },
    resolvedAt: {
      type: Date,
      default: null
      // When the ticket was marked as completed
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
      // Tenant who reported the issue
    }
  },
  {
    timestamps: true
  }
);

maintenanceTicketSchema.index({ unit: 1 });
maintenanceTicketSchema.index({ contract: 1 });
maintenanceTicketSchema.index({ tenant: 1 });
maintenanceTicketSchema.index({ status: 1 });
maintenanceTicketSchema.index({ priority: 1 });
maintenanceTicketSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
