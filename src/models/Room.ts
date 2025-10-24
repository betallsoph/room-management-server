import mongoose, { Schema, Document, Model } from 'mongoose';

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

export interface IRoom extends Document {
  buildingId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  floorNumber: number;
  roomNumber: string;
  name: string;
  area: number;
  capacity: number;
  price: number;
  status: RoomStatus;
  amenities?: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
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
    floorNumber: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      default: 2,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RoomStatus),
      default: RoomStatus.AVAILABLE,
      index: true,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

RoomSchema.index({ buildingId: 1, blockId: 1, floorNumber: 1 });
RoomSchema.index({ blockId: 1, status: 1 });
RoomSchema.index({ roomNumber: 1 });

RoomSchema.virtual('tenants', {
  ref: 'Tenant',
  localField: '_id',
  foreignField: 'roomId',
});

const Room: Model<IRoom> = mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
