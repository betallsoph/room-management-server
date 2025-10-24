import mongoose, { Schema, Document, Model } from 'mongoose';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface InvoiceAttachment {
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy?: mongoose.Types.ObjectId;
  uploadedAt: Date;
  note?: string;
}

export interface InvoiceLineItem {
  label: string;
  amount: number;
  description?: string;
}

export interface IInvoice extends Document {
  buildingId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  period: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  totalAmount: number;
  balanceDue: number;
  dueDate?: Date;
  sentAt?: Date;
  paidAt?: Date;
  notes?: string;
  attachments: InvoiceAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<InvoiceAttachment>(
  {
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileType: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      min: 0,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const LineItemSchema = new Schema<InvoiceLineItem>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    buildingId: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
      index: true,
    },
    blockId: {
      type: Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    period: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.DRAFT,
      index: true,
    },
    lineItems: {
      type: [LineItemSchema],
      default: [],
      validate: [
        (items: InvoiceLineItem[]) => items.length > 0,
        'Invoice must have at least one line item',
      ],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

InvoiceSchema.index(
  {
    tenantId: 1,
    period: 1,
  },
  { unique: true },
);

InvoiceSchema.index(
  {
    roomId: 1,
    period: 1,
  },
  { unique: true },
);

InvoiceSchema.index({
  buildingId: 1,
  blockId: 1,
  status: 1,
  period: 1,
});

const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
