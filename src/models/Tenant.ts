import mongoose, { Schema, Document, Model } from 'mongoose';

export enum TenantStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  MOVED_OUT = 'moved-out',
}

export interface TenantEmergencyContact {
  fullName: string;
  phone: string;
  relationship?: string;
}

export interface ITenant extends Document {
  roomId: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  email?: string;
  idCard: string;
  dateOfBirth: Date;
  hometown?: string;
  moveInDate: Date;
  moveOutDate?: Date;
  deposit: number;
  monthlyRent: number;
  status: TenantStatus;
  emergencyContact?: TenantEmergencyContact;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    idCard: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    hometown: {
      type: String,
      trim: true,
    },
    moveInDate: {
      type: Date,
      required: true,
    },
    moveOutDate: {
      type: Date,
    },
    deposit: {
      type: Number,
      required: true,
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TenantStatus),
      default: TenantStatus.ACTIVE,
      index: true,
    },
    emergencyContact: {
      fullName: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

TenantSchema.index({ roomId: 1, status: 1 });
TenantSchema.index({ phone: 1 });
TenantSchema.index({ idCard: 1 });

const Tenant: Model<ITenant> = mongoose.model<ITenant>('Tenant', TenantSchema);

export default Tenant;
