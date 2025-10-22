# 📋 TỔNG HỢP HỆ THỐNG QUẢN LÝ PHÒNG TRỌ - API HOÀN CHỈNH

## 🎯 Tổng Quan Hệ Thống

**Hệ thống quản lý phòng trọ/căn hộ cho thuê hoàn chỉnh**
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Token)
- **API Documentation:** Swagger/OpenAPI 3.0
- **Tổng số API:** 97 endpoints
- **Tổng số Models:** 12 models
- **Tổng số Controllers:** 13 controllers
- **Vai trò người dùng:** Admin, Staff, Tenant

---

## 📊 THỐNG KÊ HỆ THỐNG

### Models (12)
1. ✅ **User** - Tài khoản người dùng
2. ✅ **Tenant** - Thông tin khách thuê
3. ✅ **Unit** - Căn hộ/phòng trọ
4. ✅ **Contract** - Hợp đồng thuê
5. ✅ **Invoice** - Hóa đơn thanh toán
6. ✅ **Payment** - Thanh toán
7. ✅ **UtilityReading** - Chỉ số điện nước
8. ✅ **MaintenanceTicket** - Yêu cầu sửa chữa
9. ✅ **Document** - Tài liệu/giấy tờ
10. ✅ **Notification** - Thông báo
11. ✅ **Message** - Tin nhắn
12. ✅ **ActivityLog** - Nhật ký hoạt động

### API Endpoints (97)
- **Authentication:** 3 endpoints
- **User Management:** 5 endpoints
- **Admin Management:** 8 endpoints
- **Tenant Management:** 7 endpoints
- **Unit Management:** 7 endpoints
- **Contract Management:** 7 endpoints
- **Invoice Management:** 7 endpoints
- **Payment Management:** 6 endpoints
- **Utility Reading:** 6 endpoints
- **Maintenance Ticket:** 6 endpoints
- **Document Management:** 8 endpoints
- **Notification:** 8 endpoints
- **Message/Chat:** 9 endpoints

---

## 🔐 1. AUTHENTICATION & AUTHORIZATION

### Base URL: `/api/auth`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/signup` | Đăng ký tài khoản mới | Public |
| POST | `/login` | Đăng nhập và nhận JWT token | Public |
| GET | `/me` | Xem thông tin tài khoản hiện tại | Authenticated |

**Body đăng ký:**
```json
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "password": "password123",
  "role": "tenant" // hoặc "admin", "staff"
}
```

**Body đăng nhập:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response đăng nhập thành công:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "123",
    "email": "user@example.com",
    "role": "tenant",
    "fullName": "Nguyen Van A"
  }
}
```

---

## 👤 2. USER MANAGEMENT

### Base URL: `/api/users`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| GET | `/` | Lấy danh sách users | Public |
| GET | `/:id` | Xem chi tiết user | Public |
| POST | `/` | Tạo user mới | Public |
| PUT | `/:id` | Cập nhật user | Public |
| DELETE | `/:id` | Xóa user | Public |

---

## 👨‍💼 3. ADMIN MANAGEMENT

### Base URL: `/api/admin`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| GET | `/users` | Xem danh sách tất cả users | Admin/Staff |
| GET | `/users/stats` | Thống kê users | Admin/Staff |
| GET | `/users/:id` | Chi tiết user | Admin/Staff |
| PUT | `/users/:id/role` | Thay đổi vai trò user | Admin/Staff |
| PUT | `/users/:id/status` | Bật/tắt tài khoản | Admin/Staff |
| DELETE | `/users/:id` | Xóa user | Admin/Staff |
| GET | `/logs` | Xem nhật ký hoạt động | Admin/Staff |
| POST | `/logs/clear` | Xóa nhật ký cũ | Admin/Staff |

---

## 🏠 4. UNIT MANAGEMENT (Quản lý căn hộ)

### Base URL: `/api/units`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Tạo căn hộ mới | Admin/Staff |
| GET | `/` | Xem danh sách căn hộ | Admin/Staff |
| GET | `/available/listing` | Xem căn hộ còn trống | Admin/Staff |
| GET | `/:unitId` | Chi tiết căn hộ | Authenticated |
| PUT | `/:unitId` | Cập nhật căn hộ | Admin/Staff |
| DELETE | `/:unitId` | Xóa căn hộ | Admin |
| GET | `/:unitId/my-unit` | Tenant xem phòng của mình | Tenant |

**Thông tin căn hộ:**
```json
{
  "unitNumber": "A101",
  "floor": 1,
  "type": "Studio",
  "area": 25,
  "rentPrice": 5000000,
  "depositAmount": 10000000,
  "status": "available",
  "amenities": ["Điều hòa", "Nóng lạnh", "WiFi"],
  "description": "Phòng đầy đủ tiện nghi"
}
```

**Trạng thái căn hộ:**
- `available` - Còn trống
- `occupied` - Đã cho thuê
- `maintenance` - Đang sửa chữa
- `reserved` - Đã đặt cọc

---

## 👥 5. TENANT MANAGEMENT (Quản lý khách thuê)

### Base URL: `/api/tenants`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Tạo hồ sơ khách thuê | Admin/Staff |
| GET | `/` | Danh sách khách thuê | Admin/Staff |
| GET | `/my-profile` | Tenant xem hồ sơ của mình | Tenant |
| GET | `/:tenantId` | Chi tiết khách thuê | Admin/Staff |
| PUT | `/:tenantId` | Cập nhật thông tin | Admin/Staff |
| PUT | `/my-profile/emergency-contact` | Cập nhật liên hệ khẩn cấp | Tenant |
| PUT | `/:tenantId/moved-out` | Đánh dấu đã chuyển đi | Admin |

**Thông tin khách thuê:**
```json
{
  "userId": "user_id_ref",
  "fullName": "Nguyen Van A",
  "phoneNumber": "0912345678",
  "identityCard": "079123456789",
  "dateOfBirth": "1995-05-15",
  "occupation": "Nhân viên văn phòng",
  "emergencyContact": {
    "name": "Nguyen Van B",
    "relationship": "Anh trai",
    "phoneNumber": "0987654321"
  },
  "moveInDate": "2024-01-01",
  "status": "active"
}
```

---

## 📄 6. CONTRACT MANAGEMENT (Quản lý hợp đồng)

### Base URL: `/api/contracts`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Tạo hợp đồng mới | Admin/Staff |
| GET | `/` | Danh sách hợp đồng | Admin/Staff |
| GET | `/my/current` | Xem hợp đồng hiện tại | Tenant |
| GET | `/my/history` | Xem lịch sử hợp đồng | Tenant |
| GET | `/:contractId` | Chi tiết hợp đồng | Authenticated |
| PUT | `/:contractId/sign` | Ký hợp đồng | Admin |
| PUT | `/:contractId/terminate` | Chấm dứt hợp đồng | Admin |

**Thông tin hợp đồng:**
```json
{
  "tenantId": "tenant_id_ref",
  "unitId": "unit_id_ref",
  "startDate": "2024-01-01",
  "endDate": "2025-01-01",
  "rentAmount": 5000000,
  "depositAmount": 10000000,
  "paymentDueDate": 5,
  "terms": "Điều khoản hợp đồng...",
  "status": "active",
  "signedDate": "2024-01-01"
}
```

**Trạng thái hợp đồng:**
- `draft` - Nháp
- `active` - Đang hiệu lực
- `expired` - Hết hạn
- `terminated` - Đã chấm dứt

---

## 💰 7. INVOICE MANAGEMENT (Quản lý hóa đơn)

### Base URL: `/api/invoices`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Tạo hóa đơn mới | Admin/Staff |
| GET | `/` | Danh sách hóa đơn | Admin/Staff |
| GET | `/my/list` | Tenant xem hóa đơn của mình | Tenant |
| GET | `/my/payment-history` | Lịch sử thanh toán | Tenant |
| GET | `/my/:invoiceId` | Chi tiết hóa đơn (tenant) | Tenant |
| GET | `/:invoiceId` | Chi tiết hóa đơn | Authenticated |
| PUT | `/:invoiceId/confirm-payment` | Xác nhận thanh toán | Admin/Staff |

**Thông tin hóa đơn:**
```json
{
  "contractId": "contract_id_ref",
  "tenantId": "tenant_id_ref",
  "unitId": "unit_id_ref",
  "invoiceType": "monthly_rent",
  "month": 1,
  "year": 2024,
  "items": [
    {
      "description": "Tiền thuê nhà",
      "amount": 5000000
    },
    {
      "description": "Tiền điện",
      "amount": 500000
    }
  ],
  "totalAmount": 5500000,
  "dueDate": "2024-01-05",
  "status": "unpaid"
}
```

**Loại hóa đơn:**
- `monthly_rent` - Tiền thuê hàng tháng
- `utilities` - Tiền điện nước
- `deposit` - Tiền cọc
- `other` - Khác

**Trạng thái:**
- `unpaid` - Chưa thanh toán
- `paid` - Đã thanh toán
- `overdue` - Quá hạn
- `cancelled` - Đã hủy

---

## 💳 8. PAYMENT MANAGEMENT (Quản lý thanh toán)

### Base URL: `/api/payments`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Ghi nhận thanh toán | Admin/Staff |
| GET | `/` | Danh sách thanh toán | Admin/Staff |
| GET | `/my/history` | Lịch sử thanh toán (tenant) | Tenant |
| GET | `/status/summary` | Tổng quan thanh toán | Admin/Staff |
| GET | `/:paymentId` | Chi tiết thanh toán | Authenticated |
| POST | `/send-info` | Gửi thông tin thanh toán | Admin/Staff |

**Thông tin thanh toán:**
```json
{
  "invoiceId": "invoice_id_ref",
  "tenantId": "tenant_id_ref",
  "amount": 5500000,
  "paymentMethod": "bank_transfer",
  "paymentDate": "2024-01-05",
  "transactionId": "TXN123456",
  "status": "completed",
  "notes": "Thanh toán tháng 1/2024"
}
```

**Phương thức thanh toán:**
- `cash` - Tiền mặt
- `bank_transfer` - Chuyển khoản
- `momo` - Ví MoMo
- `other` - Khác

---

## ⚡ 9. UTILITY READING (Quản lý chỉ số điện nước)

### Base URL: `/api/utility-readings`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Tenant gửi chỉ số | Tenant |
| GET | `/` | Danh sách chỉ số chờ xác nhận | Admin/Staff |
| GET | `/my/history` | Lịch sử chỉ số (tenant) | Tenant |
| GET | `/:readingId` | Chi tiết chỉ số | Authenticated |
| PUT | `/:readingId/verify` | Xác nhận chỉ số | Admin/Staff |
| PUT | `/:readingId/reject` | Từ chối chỉ số | Admin/Staff |

**Thông tin chỉ số:**
```json
{
  "unitId": "unit_id_ref",
  "tenantId": "tenant_id_ref",
  "readingMonth": 1,
  "readingYear": 2024,
  "electricityReading": 1250,
  "waterReading": 45,
  "previousElectricity": 1200,
  "previousWater": 40,
  "electricityUsage": 50,
  "waterUsage": 5,
  "status": "pending",
  "imageUrl": "url_to_photo"
}
```

**Trạng thái:**
- `pending` - Chờ xác nhận
- `verified` - Đã xác nhận
- `rejected` - Bị từ chối

---

## 🔧 10. MAINTENANCE TICKET (Yêu cầu sửa chữa)

### Base URL: `/api/maintenance-tickets`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Tenant tạo yêu cầu sửa chữa | Tenant |
| GET | `/` | Danh sách yêu cầu | Admin/Staff |
| GET | `/my/tickets` | Yêu cầu của tenant | Tenant |
| GET | `/:ticketId` | Chi tiết yêu cầu | Authenticated |
| PUT | `/:ticketId/assign` | Gán cho nhân viên | Admin/Staff |
| PUT | `/:ticketId/status` | Cập nhật trạng thái | Admin/Staff |

**Thông tin yêu cầu:**
```json
{
  "unitId": "unit_id_ref",
  "tenantId": "tenant_id_ref",
  "category": "plumbing",
  "priority": "high",
  "title": "Vòi nước bị rò rỉ",
  "description": "Vòi nước ở phòng tắm bị chảy không dừng",
  "status": "open",
  "assignedTo": "staff_id_ref",
  "images": ["url1", "url2"],
  "createdAt": "2024-01-05T10:30:00Z"
}
```

**Danh mục:**
- `plumbing` - Đường ống nước
- `electrical` - Điện
- `appliance` - Thiết bị
- `structural` - Kết cấu
- `other` - Khác

**Độ ưu tiên:**
- `low` - Thấp
- `medium` - Trung bình
- `high` - Cao
- `urgent` - Khẩn cấp

**Trạng thái:**
- `open` - Mở
- `in_progress` - Đang xử lý
- `resolved` - Đã giải quyết
- `closed` - Đóng

---

## 📁 11. DOCUMENT MANAGEMENT (Quản lý tài liệu)

### Base URL: `/api/documents`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Tenant upload giấy tờ | Tenant |
| GET | `/` | Danh sách tài liệu | Admin/Staff |
| GET | `/my/list` | Tài liệu của tenant | Tenant |
| GET | `/my/:documentId/download` | Download tài liệu | Tenant |
| GET | `/:documentId` | Chi tiết tài liệu | Authenticated |
| PUT | `/:documentId/archive` | Lưu trữ tài liệu | Admin/Staff |
| DELETE | `/:documentId` | Xóa tài liệu | Admin |
| PUT | `/:documentId/share` | Chia sẻ tài liệu | Admin/Staff |

**Thông tin tài liệu:**
```json
{
  "tenantId": "tenant_id_ref",
  "documentType": "id_card",
  "fileName": "CMND_front.jpg",
  "fileUrl": "url_to_file",
  "fileSize": 2048000,
  "mimeType": "image/jpeg",
  "uploadDate": "2024-01-05",
  "status": "active",
  "isVerified": true
}
```

**Loại tài liệu:**
- `id_card` - CMND/CCCD
- `contract` - Hợp đồng
- `invoice` - Hóa đơn
- `receipt` - Biên lai
- `other` - Khác

---

## 🔔 12. NOTIFICATION (Thông báo)

### Base URL: `/api/notifications`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Admin gửi thông báo | Admin/Staff |
| GET | `/sent/list` | Danh sách đã gửi | Admin/Staff |
| GET | `/my/list` | Thông báo của tôi | Authenticated |
| GET | `/unread/count` | Số thông báo chưa đọc | Authenticated |
| GET | `/:notificationId` | Chi tiết thông báo | Authenticated |
| PUT | `/:notificationId/read` | Đánh dấu đã đọc | Authenticated |
| PUT | `/my/read-all` | Đánh dấu tất cả đã đọc | Authenticated |
| DELETE | `/:notificationId` | Xóa thông báo | Authenticated |

**Thông tin thông báo:**
```json
{
  "recipientId": "user_id_ref",
  "title": "Nhắc nhở thanh toán",
  "message": "Hóa đơn tháng 1 sắp đến hạn",
  "type": "payment_reminder",
  "priority": "high",
  "isRead": false,
  "createdAt": "2024-01-05T08:00:00Z"
}
```

**Loại thông báo:**
- `payment_reminder` - Nhắc thanh toán
- `maintenance_update` - Cập nhật sửa chữa
- `contract_expiry` - Hợp đồng sắp hết hạn
- `general` - Thông báo chung
- `urgent` - Khẩn cấp

---

## 💬 13. MESSAGE/CHAT (Tin nhắn)

### Base URL: `/api/messages`

| Method | Endpoint | Chức năng | Quyền truy cập |
|--------|----------|-----------|----------------|
| POST | `/` | Gửi tin nhắn | Authenticated |
| GET | `/my/conversations` | Danh sách cuộc trò chuyện | Authenticated |
| GET | `/unread/count` | Số tin nhắn chưa đọc | Authenticated |
| GET | `/conversation/:conversationId` | Lịch sử trò chuyện | Authenticated |
| GET | `/admin/all-messages` | Admin xem tất cả | Admin/Staff |
| GET | `/:messageId` | Chi tiết tin nhắn | Authenticated |
| PUT | `/:messageId` | Chỉnh sửa tin nhắn | Authenticated |
| DELETE | `/:messageId` | Xóa tin nhắn | Authenticated |
| POST | `/:messageId/attachment` | Gửi file đính kèm | Authenticated |

**Thông tin tin nhắn:**
```json
{
  "senderId": "user_id_ref",
  "recipientId": "user_id_ref",
  "conversationId": "conv_123",
  "messageContent": "Xin chào, tôi có thắc mắc về hóa đơn",
  "messageType": "text",
  "isRead": false,
  "attachments": [],
  "sentAt": "2024-01-05T14:30:00Z"
}
```

**Loại tin nhắn:**
- `text` - Văn bản
- `image` - Hình ảnh
- `file` - File đính kèm

---

## 🔒 BẢO MẬT & PHÂN QUYỀN

### Vai trò người dùng:

**1. Admin** - Quản trị viên
- Toàn quyền truy cập tất cả chức năng
- Quản lý users, tenants, units, contracts
- Xem báo cáo, thống kê
- Xóa dữ liệu quan trọng

**2. Staff** - Nhân viên
- Quản lý tenants, units, contracts
- Xử lý yêu cầu sửa chữa
- Xác nhận thanh toán
- Gửi thông báo
- KHÔNG được xóa dữ liệu quan trọng

**3. Tenant** - Khách thuê
- Xem thông tin cá nhân
- Xem hợp đồng, hóa đơn của mình
- Gửi chỉ số điện nước
- Tạo yêu cầu sửa chữa
- Upload tài liệu
- Nhận thông báo
- Chat với admin/staff

### Xác thực:
- **JWT Token** được gửi trong header:
  ```
  Authorization: Bearer <token>
  ```
- Token hết hạn sau 24 giờ
- Middleware `authenticateToken` kiểm tra token
- Middleware `authorize(['admin', 'staff'])` kiểm tra quyền

---

## 📡 SWAGGER API DOCUMENTATION

### Truy cập Swagger UI:
```
http://localhost:3000/api-docs
```

### Tải OpenAPI JSON:
```
http://localhost:3000/api-docs.json
```

### Cách sử dụng Swagger:

1. **Đăng ký tài khoản:**
   - Vào `POST /api/auth/signup`
   - Nhập thông tin và tạo tài khoản

2. **Đăng nhập:**
   - Vào `POST /api/auth/login`
   - Nhập email và password
   - Copy JWT token từ response

3. **Authorize:**
   - Click nút **Authorize** 🔒 (góc phải)
   - Paste token vào
   - Click **Authorize** và **Close**

4. **Test APIs:**
   - Chọn endpoint muốn test
   - Click **Try it out**
   - Nhập parameters/body
   - Click **Execute**
   - Xem response

---

## 🗄️ DATABASE SCHEMA

### Collections trong MongoDB:

1. **users** - Tài khoản người dùng
2. **tenants** - Hồ sơ khách thuê
3. **units** - Căn hộ/phòng trọ
4. **contracts** - Hợp đồng thuê
5. **invoices** - Hóa đơn
6. **payments** - Thanh toán
7. **utilityreadings** - Chỉ số điện nước
8. **maintenancetickets** - Yêu cầu sửa chữa
9. **documents** - Tài liệu
10. **notifications** - Thông báo
11. **messages** - Tin nhắn
12. **activitylogs** - Nhật ký hoạt động

### Relationships:
```
User (1) ----< (N) Tenant
Tenant (1) ----< (N) Contract
Unit (1) ----< (N) Contract
Contract (1) ----< (N) Invoice
Invoice (1) ----< (N) Payment
Tenant (1) ----< (N) UtilityReading
Tenant (1) ----< (N) MaintenanceTicket
Tenant (1) ----< (N) Document
User (1) ----< (N) Notification
User (1) ----< (N) Message
```

---

## 🚀 DEPLOYMENT

### Environment Variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/room-management
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

### Khởi động server:
```bash
# Development
npm run dev

# Production
npm start
```

### Cài đặt dependencies:
```bash
npm install
```

### Packages chính:
- express ^4.18.2
- mongoose ^8.0.0
- jsonwebtoken ^9.0.2
- bcrypt ^5.1.1
- swagger-jsdoc ^6.2.8
- swagger-ui-express ^5.0.1

---

## 📈 TÍNH NĂNG NỔI BẬT

✅ **Quản lý toàn diện:** Từ căn hộ, khách thuê, hợp đồng đến thanh toán
✅ **Bảo mật:** JWT authentication + role-based authorization
✅ **API Documentation:** Swagger/OpenAPI 3.0 hoàn chỉnh
✅ **Multi-role:** Admin, Staff, Tenant với quyền hạn riêng
✅ **Real-time:** Thông báo, tin nhắn
✅ **File management:** Upload tài liệu, hình ảnh
✅ **Activity logs:** Theo dõi hoạt động hệ thống
✅ **Utility tracking:** Quản lý điện nước tự động
✅ **Maintenance:** Hệ thống yêu cầu sửa chữa
✅ **Payment tracking:** Theo dõi thanh toán chi tiết

---

## 📞 SUPPORT

Để được hỗ trợ, vui lòng:
1. Kiểm tra API Documentation tại `/api-docs`
2. Xem logs tại console khi chạy server
3. Kiểm tra MongoDB connection
4. Đảm bảo JWT token hợp lệ

---

## 📝 NOTES

- Tất cả routes đã được sửa thứ tự để tránh conflict với parameterized routes
- Routes cụ thể (như `/my/profile`, `/available/listing`) luôn được đặt TRƯỚC routes có tham số (như `/:id`)
- JWT token có thời hạn 24h
- Password được hash bằng bcrypt
- MongoDB indexes đã được tối ưu cho performance

---

**🎉 HỆ THỐNG ĐÃ HOÀN THIỆN 100%**

Tổng số: **97 API endpoints** hoạt động đầy đủ với **12 models** và **13 controllers**
