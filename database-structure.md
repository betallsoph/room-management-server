# Database Design - MongoDB + Mongoose

## 🗄️ Tech Stack

- **Database**: MongoDB
- **ODM**: Mongoose
- **Language**: TypeScript
- **Hosting**: MongoDB Atlas (free tier 512MB)

---

## 📊 Simplified Data Structure

```
Building (Căn hộ)
    ↓
Block (Dãy/Khu)
    ↓
Room (Phòng)
    ↓
Tenant (Khách thuê)
```

**✨ Đã bỏ Floor (Tầng) để đơn giản hóa!**

---

## 🏗️ MongoDB Schema Design

### 1. Building Schema

```typescript
// models/Building.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilding extends Document {
  name: string;
  address: string;
  description?: string;
  totalBlocks: number;
  createdAt: Date;
  updatedAt: Date;
}

const BuildingSchema = new Schema<IBuilding>(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    address: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    totalBlocks: { 
      type: Number, 
      default: 0 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate blocks
BuildingSchema.virtual('blocks', {
  ref: 'Block',
  localField: '_id',
  foreignField: 'buildingId'
});

export default mongoose.model<IBuilding>('Building', BuildingSchema);
```

### 2. Block Schema

```typescript
// models/Block.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBlock extends Document {
  buildingId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
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
      index: true
    },
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String 
    },
    totalRooms: { 
      type: Number, 
      default: 0 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for queries
BlockSchema.index({ buildingId: 1, name: 1 });

// Virtual populate rooms
BlockSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'blockId'
});

// Cascade delete rooms when block is deleted
BlockSchema.pre('remove', async function(next) {
  await mongoose.model('Room').deleteMany({ blockId: this._id });
  next();
});

export default mongoose.model<IBlock>('Block', BlockSchema);
```

### 3. Room Schema

```typescript
// models/Room.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved'
}

export interface IRoom extends Document {
  blockId: mongoose.Types.ObjectId;
  roomNumber: string;
  name: string;
  area: number; // m²
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
    blockId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Block',
      required: true,
      index: true
    },
    roomNumber: { 
      type: String, 
      required: true,
      unique: true,
      trim: true
    },
    name: { 
      type: String, 
      required: true 
    },
    area: { 
      type: Number, 
      required: true 
    },
    capacity: { 
      type: Number, 
      default: 2 
    },
    price: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: Object.values(RoomStatus),
      default: RoomStatus.AVAILABLE,
      index: true
    },
    amenities: [{ 
      type: String 
    }],
    description: { 
      type: String 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
RoomSchema.index({ blockId: 1, status: 1 });
RoomSchema.index({ roomNumber: 1 });

// Virtual populate tenants
RoomSchema.virtual('tenants', {
  ref: 'Tenant',
  localField: '_id',
  foreignField: 'roomId'
});

// Cascade delete tenants when room is deleted
RoomSchema.pre('remove', async function(next) {
  await mongoose.model('Tenant').deleteMany({ roomId: this._id });
  next();
});

export default mongoose.model<IRoom>('Room', RoomSchema);
```

### 4. Tenant Schema

```typescript
// models/Tenant.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum TenantStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export interface ITenant extends Document {
  roomId: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  email?: string;
  idCard: string; // CMND/CCCD
  dateOfBirth: Date;
  hometown?: string;
  moveInDate: Date;
  moveOutDate?: Date;
  deposit: number;
  monthlyRent: number;
  status: TenantStatus;
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
      index: true
    },
    fullName: { 
      type: String, 
      required: true,
      trim: true
    },
    phone: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String,
      trim: true,
      lowercase: true
    },
    idCard: { 
      type: String, 
      required: true,
      trim: true
    },
    dateOfBirth: { 
      type: Date, 
      required: true 
    },
    hometown: { 
      type: String 
    },
    moveInDate: { 
      type: Date, 
      required: true 
    },
    moveOutDate: { 
      type: Date 
    },
    deposit: { 
      type: Number, 
      required: true 
    },
    monthlyRent: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: Object.values(TenantStatus),
      default: TenantStatus.ACTIVE,
      index: true
    },
    notes: { 
      type: String 
    },
  },
  { 
    timestamps: true 
  }
);

// Indexes
TenantSchema.index({ roomId: 1, status: 1 });
TenantSchema.index({ phone: 1 });
TenantSchema.index({ idCard: 1 });

export default mongoose.model<ITenant>('Tenant', TenantSchema);
```

### 5. Invoice Schema (Optional - for later)

```typescript
// models/Invoice.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface IInvoice extends Document {
  tenantId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  month: Date;
  rentAmount: number;
  electricFee: number;
  waterFee: number;
  otherFees: number;
  totalAmount: number;
  status: InvoiceStatus;
  paidAt?: Date;
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    tenantId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Tenant',
      required: true,
      index: true
    },
    roomId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Room',
      required: true,
      index: true
    },
    month: { 
      type: Date, 
      required: true,
      index: true
    },
    rentAmount: { 
      type: Number, 
      required: true 
    },
    electricFee: { 
      type: Number, 
      default: 0 
    },
    waterFee: { 
      type: Number, 
      default: 0 
    },
    otherFees: { 
      type: Number, 
      default: 0 
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.PENDING,
      index: true
    },
    paidAt: { 
      type: Date 
    },
    dueDate: { 
      type: Date, 
      required: true 
    },
    notes: { 
      type: String 
    },
  },
  { 
    timestamps: true 
  }
);

// Compound index
InvoiceSchema.index({ tenantId: 1, month: 1 }, { unique: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
```

---

## 🔌 Database Connection

```typescript
// config/database.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || '', {
      // Options (most are default in Mongoose 6+)
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

```typescript
// server.ts
import express from 'express';
import connectDB from './config/database';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 📝 API Examples with Mongoose

### Get Tenant with full hierarchy

```typescript
// routes/admin/tenants.ts
import { Router } from 'express';
import Tenant from '../../models/Tenant';

const router = Router();

// GET /api/admin/tenants/:id
router.get('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate({
        path: 'roomId',
        populate: {
          path: 'blockId',
          populate: {
            path: 'buildingId'
          }
        }
      });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
```

### Create Tenant with validation

```typescript
// POST /api/admin/tenants
router.post('/', async (req, res) => {
  try {
    const { roomId, fullName, phone, idCard, dateOfBirth, moveInDate, deposit, monthlyRent } = req.body;

    // 1. Check room exists
    const room = await Room.findById(roomId).populate('blockId');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // 2. Check room is available
    if (room.status !== RoomStatus.AVAILABLE) {
      return res.status(400).json({ error: 'Room is not available' });
    }

    // 3. Check no active tenant in this room
    const existingTenant = await Tenant.findOne({
      roomId,
      status: TenantStatus.ACTIVE
    });

    if (existingTenant) {
      return res.status(400).json({ error: 'Room already occupied' });
    }

    // 4. Create tenant & update room (Transaction with session)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tenant = await Tenant.create([{
        roomId,
        fullName,
        phone,
        idCard,
        dateOfBirth,
        moveInDate,
        deposit,
        monthlyRent,
        status: TenantStatus.ACTIVE
      }], { session });

      // Update room status
      await Room.findByIdAndUpdate(
        roomId,
        { status: RoomStatus.OCCUPIED },
        { session }
      );

      await session.commitTransaction();
      
      res.status(201).json(tenant[0]);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

### Get statistics

```typescript
// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Total buildings
    const totalBuildings = await Building.countDocuments();

    // Total blocks
    const totalBlocks = await Block.countDocuments();

    // Total rooms
    const totalRooms = await Room.countDocuments();

    // Occupied rooms
    const occupiedRooms = await Room.countDocuments({ 
      status: RoomStatus.OCCUPIED 
    });

    // Available rooms
    const availableRooms = await Room.countDocuments({ 
      status: RoomStatus.AVAILABLE 
    });

    // Active tenants
    const activeTenants = await Tenant.countDocuments({ 
      status: TenantStatus.ACTIVE 
    });

    // Revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenue = await Invoice.aggregate([
      {
        $match: {
          month: { $gte: startOfMonth },
          status: InvoiceStatus.PAID
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      totalBuildings,
      totalBlocks,
      totalRooms,
      occupiedRooms,
      availableRooms,
      activeTenants,
      monthlyRevenue: revenue[0]?.total || 0,
      occupancyRate: totalRooms > 0 
        ? ((occupiedRooms / totalRooms) * 100).toFixed(1)
        : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

---

## 🗑️ Cascade Delete Logic

```typescript
// When deleting building, cascade delete blocks, rooms, tenants
router.delete('/buildings/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const buildingId = req.params.id;

    // Get all blocks in building
    const blocks = await Block.find({ buildingId }).session(session);
    const blockIds = blocks.map(b => b._id);

    // Get all rooms in blocks
    const rooms = await Room.find({ blockId: { $in: blockIds } }).session(session);
    const roomIds = rooms.map(r => r._id);

    // Delete tenants in rooms
    await Tenant.deleteMany({ roomId: { $in: roomIds } }).session(session);

    // Delete rooms in blocks
    await Room.deleteMany({ blockId: { $in: blockIds } }).session(session);

    // Delete blocks in building
    await Block.deleteMany({ buildingId }).session(session);

    // Delete building
    await Building.findByIdAndDelete(buildingId).session(session);

    await session.commitTransaction();
    
    res.json({ message: 'Building deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to delete building' });
  } finally {
    session.endSession();
  }
});
```

---

## 🚀 Setup Instructions

### 1. Create MongoDB Atlas Account (Free)

```bash
# Go to https://www.mongodb.com/cloud/atlas
# Create free cluster (512MB)
# Get connection string
```

### 2. Install Dependencies

```bash
npm install mongoose
npm install --save-dev @types/mongoose
```

### 3. Environment Variables

```env
# .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/room-management?retryWrites=true&w=majority
NODE_ENV=development
PORT=3000
```

### 4. Project Structure

```
room-api-server/
├── src/
│   ├── models/
│   │   ├── Building.ts
│   │   ├── Block.ts
│   │   ├── Room.ts
│   │   ├── Tenant.ts
│   │   └── Invoice.ts
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── buildings.ts
│   │   │   ├── blocks.ts
│   │   │   ├── rooms.ts
│   │   │   └── tenants.ts
│   │   └── client/
│   │       ├── auth.ts
│   │       └── profile.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── config/
│   │   └── database.ts
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## 📋 Summary of Changes

### ✅ What Changed:
- ❌ **Removed Floor** - Simplified structure
- ✅ **3-level hierarchy**: Building → Block → Room → Tenant
- ✅ **MongoDB + Mongoose** instead of PostgreSQL + Prisma
- ✅ **Simpler relationships**
- ✅ **Easier to understand and maintain**

### 🎯 New Structure:
```
Building (Căn hộ Sunrise)
  └─ Block A1
      ├─ Room a1-01 → Tenant Nguyễn Văn A
      ├─ Room a1-02 → Tenant Trần Thị B
      └─ Room a1-03 (Available)
  └─ Block A2
      ├─ Room a2-01 → Tenant Lê Văn C
      └─ Room a2-02 (Available)
```

### 💡 Benefits:
- ✅ Easier to manage
- ✅ Less complexity
- ✅ Faster queries (less joins)
- ✅ Better UX (less dropdowns)
- ✅ MongoDB flexible schema

---

Bạn muốn mình giúp update UI (remove Floor pages) không? 🚀
