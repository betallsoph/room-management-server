import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBuilding extends Document {
  name: string;
  address: string;
  description?: string;
  totalBlocks: number;
  defaultAmenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BuildingSchema = new Schema<IBuilding>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    totalBlocks: {
      type: Number,
      default: 0,
    },
    defaultAmenities: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

BuildingSchema.virtual('blocks', {
  ref: 'Block',
  localField: '_id',
  foreignField: 'buildingId',
});

const Building: Model<IBuilding> = mongoose.model<IBuilding>('Building', BuildingSchema);

export default Building;
