import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  TENANT = 'tenant',
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  buildingId?: mongoose.Types.ObjectId;
  blockId?: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.ADMIN,
    },
    buildingId: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
    },
    blockId: {
      type: Schema.Types.ObjectId,
      ref: 'Block',
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, buildingId: 1 });

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
