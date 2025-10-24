# Database Design – Room Manager Admin Platform

> Tài liệu này gửi cho team backend để xây dựng API / database đúng với giao diện React Admin hiện tại.  
> Frontend đã có các trang: Buildings, Blocks, Floors (derived), Rooms, Tenants, Invoices, Notifications, Utility Readings, Maintenance, Documents, Payments.

---

## 1. Kiến trúc tổng quan

| Layer            | Lựa chọn đề xuất                                       |
|------------------|--------------------------------------------------------|
| Database         | MongoDB Atlas (free tier 512 MB)                        |
| ODM              | Mongoose + TypeScript                                  |
| Server           | Express.js (Node 20+)                                   |
| Auth             | JWT access token (optional refresh token)              |
| Hosting          | Render / Railway / Heroku (tùy team backend)           |

---

## 2. Mô hình dữ liệu gắn với UI

```
Building (Tòa nhà/Căn hộ)
  └─ Block (Block/Dãy)
       └─ Room (Phòng – chứa floorNumber)
            └─ Tenant (Khách thuê chủ động)
                 └─ Contract (tuỳ chọn, gắn với tenant-room)
```

- Trang **Floors** của frontend chỉ derive từ `room.floorNumber` → không cần bảng riêng.
- Các module khác (Invoice, Utility Reading, Maintenance Ticket, Document, Payment, Notification) tham chiếu tới `roomId` và/hoặc `tenantId`.

### 2.1 Bảng field chính cho từng collection

| Collection | Các trường quan trọng | Ghi chú liên quan tới UI |
|------------|-----------------------|---------------------------|
| `buildings` | `name`, `address`, `description`, `totalBlocks`, `defaultAmenities` | Trang Buildings + filter phòng theo tòa |
| `blocks` | `buildingId`, `name`, `description`, `totalFloors`, `totalRooms` | Trang Blocks cần totalFloors để hiển thị |
| `rooms` | `buildingId`, `blockId`, `floorNumber`, `roomNumber`, `name`, `price`, `area`, `capacity`, `status`, `amenities`, `description` | Trang Rooms + Floors; filter theo building/block/status/floor |
| `tenants` | `roomId`, `fullName`, `phone`, `email`, `idCard`, `dateOfBirth`, `moveInDate`, `deposit`, `monthlyRent`, `status`, `emergencyContact`, `notes` | Trang Tenants và modal chi tiết |
| `invoices` | `buildingId`, `blockId`, `roomId`, `tenantId`, `period (YYYY-MM)`, `status`, `lineItems[]`, `totalAmount`, `balanceDue`, `sentAt`, `paidAt`, `dueDate`, `attachments[]` | Trang Invoices + modal chi tiết với line items |
| `notifications` | `title`, `content`, `targetType (all/building/block/room/tenant)`, `targetIds[]`, `status`, `createdAt` | Trang Thông báo |
| `utilityReadings` | `roomId`, `tenantId`, `type (electric/water)`, `value`, `status (pending/verified/rejected)`, `submittedAt`, `verifiedAt`, `note` | Module Utility (đã mô tả trong product scope) |
| `maintenanceTickets` | `roomId`, `tenantId`, `title`, `description`, `status`, `priority`, `assigneeId`, `attachments[]`, `timeline[]` | Module Maintenance |
| `documents` | `ownerId`, `roomId`, `type`, `fileUrl`, `sharedWith[]`, `metadata` | Upload hồ sơ cho tenant |
| `payments` | `invoiceId`, `roomId`, `tenantId`, `amount`, `method`, `status`, `paidAt`, `receiptUrl`, `note` | Gắn với invoice |
| `messages` (optional) | `conversationId`, `senderId`, `recipientId`, `content`, `attachments`, `readAt` | Module chat |

---

## 3. Schema chi tiết (Mongoose + TypeScript)

> Dưới đây là skeleton TypeScript để backend implement nhanh. Có thể tách ra thành file riêng trong `src/models`.

### 3.1 Building

```ts
import { Schema, model, Document } from 'mongoose';

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
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    description: { type: String },
    totalBlocks: { type: Number, default: 0 },
    defaultAmenities: [{ type: String }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BuildingSchema.virtual('blocks', {
  ref: 'Block',
  localField: '_id',
  foreignField: 'buildingId',
});

export default model<IBuilding>('Building', BuildingSchema);
```

### 3.2 Block

```ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IBlock extends Document {
  buildingId: Types.ObjectId;
  name: string;
  description?: string;
  totalFloors: number;
  totalRooms: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlockSchema = new Schema<IBlock>(
  {
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    totalFloors: { type: Number, default: 0 },
    totalRooms: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BlockSchema.index({ buildingId: 1, name: 1 }, { unique: true });

BlockSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'blockId',
});

BlockSchema.pre('remove', async function (next) {
  await model('Room').deleteMany({ blockId: this._id });
  next();
});

export default model<IBlock>('Block', BlockSchema);
```

### 3.3 Room

```ts
import { Schema, model, Document, Types } from 'mongoose';

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

export interface IRoom extends Document {
  buildingId: Types.ObjectId;
  blockId: Types.ObjectId;
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
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true, index: true },
    blockId: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
    floorNumber: { type: Number, min: 0, default: 0, index: true },
    roomNumber: { type: String, required: true, trim: true },
    name: { type: String, required: true },
    area: { type: Number, required: true },
    capacity: { type: Number, default: 2 },
    price: { type: Number, required: true },
    status: { type: String, enum: Object.values(RoomStatus), default: RoomStatus.AVAILABLE, index: true },
    amenities: [{ type: String }],
    description: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

RoomSchema.index({ buildingId: 1, blockId: 1, floorNumber: 1 });
RoomSchema.index({ blockId: 1, roomNumber: 1 }, { unique: true });

RoomSchema.virtual('tenants', {
  ref: 'Tenant',
  localField: '_id',
  foreignField: 'roomId',
});

RoomSchema.pre('remove', async function (next) {
  await model('Tenant').updateMany({ roomId: this._id }, { status: 'expired' });
  await model('Invoice').deleteMany({ roomId: this._id });
  next();
});

export default model<IRoom>('Room', RoomSchema);
```

### 3.4 Tenant

```ts
import { Schema, model, Document, Types } from 'mongoose';

export enum TenantStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

export interface ITenant extends Document {
  roomId: Types.ObjectId;
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
  emergencyContact?: {
    fullName: string;
    phone: string;
    relationship?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    idCard: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    hometown: { type: String },
    moveInDate: { type: Date, required: true },
    moveOutDate: { type: Date },
    deposit: { type: Number, required: true },
    monthlyRent: { type: Number, required: true },
    status: { type: String, enum: Object.values(TenantStatus), default: TenantStatus.ACTIVE, index: true },
    emergencyContact: {
      fullName: String,
      phone: String,
      relationship: String,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

TenantSchema.index({ roomId: 1, status: 1 });
TenantSchema.index({ phone: 1 });
TenantSchema.index({ idCard: 1 });

export default model<ITenant>('Tenant', TenantSchema);
```

### 3.5 Invoice

```ts
import { Schema, model, Document, Types } from 'mongoose';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface IInvoice extends Document {
  buildingId: Types.ObjectId;
  blockId: Types.ObjectId;
  roomId: Types.ObjectId;
  tenantId: Types.ObjectId;
  period: string; // ví dụ: 2024-03
  status: InvoiceStatus;
  lineItems: Array<{
    label: string;
    amount: number;
    quantity?: number;
    unit?: string;
    description?: string;
  }>;
  totalAmount: number;
  balanceDue: number;
  sentAt?: Date;
  paidAt?: Date;
  dueDate: Date;
  notes?: string;
  attachments?: Array<{ name: string; url: string; uploadedAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', index: true },
    blockId: { type: Schema.Types.ObjectId, ref: 'Block', index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    period: { type: String, required: true, match: /^\d{4}-\d{2}$/, index: true },
    status: { type: String, enum: Object.values(InvoiceStatus), default: InvoiceStatus.DRAFT, index: true },
    lineItems: [
      {
        label: { type: String, required: true },
        amount: { type: Number, required: true },
        quantity: Number,
        unit: String,
        description: String,
      },
    ],
    totalAmount: { type: Number, required: true },
    balanceDue: { type: Number, required: true },
    sentAt: Date,
    paidAt: Date,
    dueDate: { type: Date, required: true },
    notes: String,
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

InvoiceSchema.index({ tenantId: 1, period: 1 }, { unique: true });

export default model<IInvoice>('Invoice', InvoiceSchema);
```

> Các collection khác (notifications, utilityReadings, maintenanceTickets, documents, payments) có thể khai triển tương tự – giữ đúng trường như bảng tổng quan mục 2.1.

---

## 4. API contract (tối thiểu để frontend hoạt động)

| Resource | Method | Endpoint | Mô tả |
|----------|--------|----------|-------|
| Building | GET | `/api/buildings` | Pagination + search (`keyword`, `page`, `limit`) |
|          | POST | `/api/buildings` | Tạo mới |
|          | GET | `/api/buildings/:id` | Chi tiết + thống kê blocks/rooms |
|          | PUT | `/api/buildings/:id` | Cập nhật |
|          | DELETE | `/api/buildings/:id` | Cascade block → room → tenant |
| Block | GET | `/api/buildings/:buildingId/blocks` | Danh sách block của tòa |
|       | POST | `/api/blocks` | Tạo block |
|       | PUT/DELETE | `/api/blocks/:id` | Cập nhật/xóa |
| Room | GET | `/api/rooms` | Filter `buildingId`, `blockId`, `status`, `floorNumber`, `search` |
|      | POST | `/api/rooms` | Tạo phòng |
|      | GET | `/api/rooms/:id` | Chi tiết (populate tenant active) |
|      | PUT/DELETE | `/api/rooms/:id` | Cập nhật/xóa |
| Tenant | GET | `/api/tenants` | Filter theo room/block/building/status |
|        | POST | `/api/tenants` | Tạo tenant mới, set room status `occupied` |
|        | GET | `/api/tenants/:id` | Chi tiết + populate room → block → building |
|        | PUT | `/api/tenants/:id` | Cập nhật hồ sơ/emergency contact |
|        | DELETE | `/api/tenants/:id` | Chuyển room về `available`, lưu history |
| Invoice | GET | `/api/invoices` | Filter `period`, `status`, `tenantId`, `roomId`, `buildingId`, `blockId` |
|         | POST | `/api/invoices` | Tạo invoice mới (lineItems, notes…) |
|         | PUT | `/api/invoices/:id` | Cập nhật line items / note / dueDate |
|         | POST | `/api/invoices/:id/attachments` | Upload chứng từ |
|         | PATCH | `/api/invoices/:id/status` | Toggle `sent`, `paid` (kèm timestamps) |
| Notifications | POST | `/api/notifications` | Gửi notification (admin) |
|               | GET | `/api/notifications` | Lọc theo targetType, trạng thái |
| Utility Readings | GET/POST/PUT | `/api/utility-readings*` | Theo spec trong Swagger guide |
| Maintenance Tickets | GET/POST/PUT | `/api/maintenance-tickets*` | Như product scope |
| Auth | POST | `/api/auth/login` | Email/password → JWT |
|      | GET | `/api/auth/me` | Thông tin admin |

**Response format đề xuất:**
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 200 }
}
```

**Error format:**
```json
{
  "success": false,
  "error": "MESSAGE",
  "code": "ERROR_CODE"
}
```

---

## 5. Quan hệ, cascade & hooks

| Hành động | Ảnh hưởng |
|-----------|-----------|
| Xóa Building | Xóa tất cả Blocks, Rooms, Tenants, Invoices, UtilityReadings, MaintenanceTickets liên quan (transaction). |
| Xóa Block | Xóa Rooms, Tenants, Invoices trong block. |
| Xóa Room | Set tenant `status = expired`, tạo entry move-out, xóa invoices chưa thanh toán. |
| Tạo Tenant | Cập nhật `room.status = occupied`, set `moveInDate`, `monthlyRent` = giá phòng nếu chưa nhập. |
| Xóa Tenant | Set `room.status = available`, ghi lại `moveOutDate`. |
| Mark Invoice paid | Ghi nhận thành `payments` collection. |

**Indexes quan trọng:**
- `buildings.name` (text search)
- `blocks` => `{ buildingId: 1, name: 1 }`
- `rooms` => `{ buildingId: 1, blockId: 1, floorNumber: 1 }`, `{ blockId: 1, roomNumber: 1 } unique, `{ status: 1 }`
- `tenants` => `{ roomId: 1, status: 1 }`, `{ phone: 1 }`, `{ idCard: 1 }`
- `invoices` => `{ tenantId: 1, period: 1 } unique`

---

## 6. Sample documents

```jsonc
// building
{
  "_id": "65f21b4c98b1a1f4e3d2c111",
  "name": "Sunrise Riverside",
  "address": "123 Nguyễn Văn Linh, Quận 7",
  "description": "Căn hộ cao cấp, 2 block chính",
  "totalBlocks": 2,
  "defaultAmenities": ["Thang máy", "Bảo vệ 24/7", "Giữ xe"],
  "createdAt": "2024-03-01T09:00:00.000Z",
  "updatedAt": "2024-03-01T09:00:00.000Z"
}

// block
{
  "_id": "65f21c20a5f332f4e3d2c222",
  "buildingId": "65f21b4c98b1a1f4e3d2c111",
  "name": "Block A1",
  "description": "Block view sông",
  "totalFloors": 25,
  "totalRooms": 150,
  "createdAt": "2024-03-01T09:05:00.000Z",
  "updatedAt": "2024-03-01T09:05:00.000Z"
}

// room
{
  "_id": "65f21d98bd1c44f4e3d2c333",
  "buildingId": "65f21b4c98b1a1f4e3d2c111",
  "blockId": "65f21c20a5f332f4e3d2c222",
  "floorNumber": 16,
  "roomNumber": "A1-16-06",
  "name": "Phòng A1-16-06",
  "area": 28,
  "capacity": 2,
  "price": 3500000,
  "status": "available",
  "amenities": ["Điều hòa", "Nóng lạnh", "Ban công"],
  "createdAt": "2024-03-01T09:10:00.000Z",
  "updatedAt": "2024-03-01T09:10:00.000Z"
}

// tenant
{
  "_id": "65f21e1117d7aaf4e3d2c444",
  "roomId": "65f21d98bd1c44f4e3d2c333",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "a.nguyen@example.com",
  "idCard": "012345678901",
  "dateOfBirth": "1995-03-15T00:00:00.000Z",
  "moveInDate": "2024-01-15T00:00:00.000Z",
  "deposit": 5000000,
  "monthlyRent": 3500000,
  "status": "active",
  "emergencyContact": {
    "fullName": "Nguyễn Văn B",
    "phone": "0907654321",
    "relationship": "Anh trai"
  },
  "createdAt": "2024-03-01T09:15:00.000Z",
  "updatedAt": "2024-03-01T09:15:00.000Z"
}

// invoice
{
  "_id": "65f21f1a7be421f4e3d2c555",
  "buildingId": "65f21b4c98b1a1f4e3d2c111",
  "blockId": "65f21c20a5f332f4e3d2c222",
  "roomId": "65f21d98bd1c44f4e3d2c333",
  "tenantId": "65f21e1117d7aaf4e3d2c444",
  "period": "2024-03",
  "status": "sent",
  "lineItems": [
    { "label": "Tiền phòng", "amount": 3500000 },
    { "label": "Điện", "amount": 220000, "description": "145 kWh" },
    { "label": "Nước", "amount": 90000, "description": "10 m³" },
    { "label": "Phí dịch vụ", "amount": 110000 }
  ],
  "totalAmount": 3920000,
  "balanceDue": 3920000,
  "sentAt": "2024-03-01T09:20:00.000Z",
  "dueDate": "2024-03-05T00:00:00.000Z",
  "createdAt": "2024-03-01T09:20:00.000Z",
  "updatedAt": "2024-03-01T09:20:00.000Z"
}
```

---

## 7. Phân quyền & JWT payload

| Role     | Quyền |
|----------|-------|
| `admin`  | CRUD tất cả dữ liệu, gửi thông báo, xem báo cáo |
| `staff`  | CRUD block/room/tenant trong building được assign |
| `tenant` | Xem phòng, invoices của mình, gửi utility readings, maintenance tickets |

JWT payload đề xuất:
```json
{
  "sub": "userId",
  "role": "admin",
  "buildingIds": ["..."] // optional: giới hạn staff
}
```

---

## 8. Lưu ý triển khai

1. **Transactions**: dùng `session` khi xóa building/block để đảm bảo cascade.  
2. **Pagination & filter**: mọi list API hỗ trợ `page`, `limit`, `sort`, `keyword`.  
3. **Search**: `keyword` áp dụng cho building name, block name, roomNumber, tenant name/phone. Có thể dùng `$text` hoặc Atlas Search.  
4. **Seeding**: cung cấp script tạo 1–2 building với data mẫu để frontend dev test.  
5. **Swagger/OpenAPI**: cập nhật file `swaggerSpec` theo bảng endpoint ở mục 4.  
6. **CORS**: mở cho `http://localhost:5173` trong môi trường dev.  
7. **Error handling**: thống nhất format `{ success: false, error, code }`.  
8. **Logging & metrics**: optional nhưng nên log các thao tác quan trọng (tạo invoice, mark paid).

---

## 9. Checklist bàn giao backend

- [ ] Tạo models + migration cho tất cả collection chính.  
- [ ] Xây dựng routes/controller RESTful theo mục 4.  
- [ ] Middleware `authenticateToken`, `authorize`.  
- [ ] Swagger UI cập nhật (đường dẫn `/api-docs`).  
- [ ] Bộ collection Postman/Insomnia để QA, frontend test.  
- [ ] Script seed dữ liệu mẫu.  
- [ ] CI lint/test (nếu team áp dụng).

---

## 10. Kết luận

- ✅ Đã chốt mô hình Building → Block → Room → Tenant và các module liên quan.  
- ✅ Chuẩn hoá schema Mongoose + sample document.  
- ✅ Liệt kê endpoints REST khớp với UI hiện tại.  
- ✅ Ghi chú transaction, cascade, auth, error format.  

Team backend chỉ cần follow tài liệu này để implement. Sau khi API sẵn sàng, frontend sẽ thay mock context bằng service call thực tế và kích hoạt toàn bộ chức năng quản lý. 🚀
