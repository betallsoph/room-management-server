import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlock extends Document {
  buildingId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  totalFloors: number;
  totalRooms: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlockSchema = new Schema<IBlock>(
  {
    buildingId: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    totalFloors: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRooms: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

BlockSchema.index({ buildingId: 1, name: 1 }, { unique: true });

BlockSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'blockId',
});

const Block: Model<IBlock> = mongoose.model<IBlock>('Block', BlockSchema);

export default Block;
