const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    unitNumber: {
      type: String,
      required: true,
      trim: true
      // Format: "101", "205", v.v.
    },
    building: {
      type: String,
      required: true,
      trim: true
      // Ví dụ: "A", "B", "C"
    },
    floor: {
      type: Number,
      required: true
    },
    squareMeters: {
      type: Number,
      required: true,
      min: 1
    },
    roomType: {
      type: String,
      enum: ['studio', 'one-bedroom', 'two-bedroom', 'three-bedroom'],
      default: 'studio'
    },
    rentPrice: {
      type: Number,
      required: true,
      min: 0
      // Tiền thuê hàng tháng
    },
    depositAmount: {
      type: Number,
      required: true,
      min: 0
      // Tiền cọc
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'rented-out'],
      default: 'available'
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    currentTenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null
    },
    amenities: {
      type: [String],
      default: []
      // Ví dụ: ['wifi', 'air-conditioner', 'water-heater', 'kitchen', 'balcony']
    },
    description: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: []
      // URL hình ảnh phòng
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index
unitSchema.index({ building: 1, unitNumber: 1 }, { unique: true }); // Compound unique index
unitSchema.index({ building: 1, floor: 1 });
unitSchema.index({ status: 1 });
unitSchema.index({ landlord: 1 });

module.exports = mongoose.model('Unit', unitSchema);
