# Apartment Rental Management System - API Documentation

## 📋 Project Overview

Nền tảng quản lý phòng thuê chung cư cho cả chủ nhà (Admin) và khách thuê (Tenant) với đầy đủ tính năng thanh toán, quản lý hợp đồng, báo cáo sự cố, chat, và thông báo.

**Stack:** Node.js + Express + MongoDB + Mongoose + JWT

---

## 🔐 Authentication Endpoints

### POST `/api/auth/signup`
Đăng ký tài khoản mới
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### POST `/api/auth/login`
Đăng nhập (trả về JWT token)
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### GET `/api/auth/me`
Xem thông tin người dùng hiện tại (yêu cầu JWT)

---

## 👤 Admin Management Endpoints

### GET `/api/admin/users`
Xem danh sách tất cả người dùng [Admin only]

### PATCH `/api/admin/users/:userId/role`
Thay đổi role người dùng [Admin only]
```json
{
  "role": "admin|staff|tenant"
}
```

### PATCH `/api/admin/users/:userId/status`
Thay đổi trạng thái người dùng (active/inactive) [Admin only]

### GET `/api/admin/activity-logs`
Xem activity logs [Admin only]

---

## 🏢 Unit Management (Phòng/Căn hộ)

### POST `/api/units`
**[Admin/Staff]** Tạo phòng mới
```json
{
  "unitNumber": "A101",
  "building": "Building A",
  "floor": 1,
  "squareMeters": 30,
  "roomType": "one-bedroom",
  "rentPrice": 5000000,
  "depositAmount": 5000000,
  "amenities": ["wifi", "ac", "kitchen"]
}
```

### GET `/api/units`
**[Admin/Staff]** Xem danh sách phòng (filter: building, status, floor, roomType)

### GET `/api/units/:unitId`
**[Admin/Staff]** Chi tiết phòng

### PUT `/api/units/:unitId`
**[Admin/Staff]** Cập nhật thông tin phòng

### DELETE `/api/units/:unitId`
**[Admin]** Xóa phòng

### GET `/api/units/available/listing`
**[Admin/Staff]** Gửi danh sách phòng trống cho khách

### GET `/api/units/:unitId/my-unit`
**[Tenant]** Xem chi tiết phòng mình đang thuê

---

## 👥 Tenant Management (Quản lý khách thuê)

### POST `/api/tenants`
**[Admin/Staff]** Tạo hồ sơ khách thuê
```json
{
  "userId": "user_id",
  "identityCard": "CCCD_number",
  "phone": "0987654321",
  "emergencyContact": {
    "name": "Họ tên",
    "phone": "0123456789",
    "relationship": "Anh em"
  }
}
```

### GET `/api/tenants`
**[Admin/Staff]** Xem danh sách khách thuê (filter: status, building)

### GET `/api/tenants/:tenantId`
**[Admin/Staff]** Chi tiết khách thuê

### PUT `/api/tenants/:tenantId`
**[Admin/Staff]** Cập nhật thông tin khách thuê

### PUT `/api/tenants/:tenantId/moved-out`
**[Admin]** Ghi nhận khách thuê chuyển đi

### GET `/api/tenants/my-profile`
**[Tenant]** Xem hồ sơ của mình

### PUT `/api/tenants/my-profile/emergency-contact`
**[Tenant]** Cập nhật thông tin liên hệ khẩn cấp

---

## 📜 Contract Management (Hợp đồng)

### POST `/api/contracts`
**[Admin/Staff]** Tạo hợp đồng cho khách
```json
{
  "unit": "unit_id",
  "tenant": "tenant_id",
  "startDate": "2025-01-01",
  "endDate": "2026-01-01",
  "rentAmount": 5000000,
  "depositAmount": 5000000,
  "utilities": {
    "electricity": false,
    "water": true,
    "internet": true
  },
  "terms": ["Payment on 5th of month", "No pets"],
  "documents": []
}
```

### GET `/api/contracts`
**[Admin/Staff]** Xem danh sách hợp đồng (filter: status, building)

### GET `/api/contracts/:contractId`
**[Admin/Staff]** Chi tiết hợp đồng

### PUT `/api/contracts/:contractId/sign`
**[Admin]** Ký hợp đồng

### PUT `/api/contracts/:contractId/terminate`
**[Admin]** Kết thúc hợp đồng

### GET `/api/contracts/my/current`
**[Tenant]** Xem hợp đồng hiệu lực của mình

### GET `/api/contracts/my/history`
**[Tenant]** Xem lịch sử hợp đồng (10 gần nhất)

---

## 💰 Invoice Management (Hóa đơn)

### POST `/api/invoices`
**[Admin/Staff]** Tạo hóa đơn tháng
```json
{
  "contract": "contract_id",
  "unit": "unit_id",
  "tenant": "tenant_id",
  "month": 1,
  "year": 2025,
  "electricity": {
    "usage": 100,
    "unitPrice": 3500,
    "totalCost": 350000
  },
  "water": {
    "usage": 15,
    "unitPrice": 20000,
    "totalCost": 300000
  },
  "internet": {
    "cost": 300000
  }
}
```

### GET `/api/invoices`
**[Admin/Staff]** Xem danh sách hóa đơn (filter: status, month, year, building)

### GET `/api/invoices/:invoiceId`
**[Admin/Staff]** Chi tiết hóa đơn

### PUT `/api/invoices/:invoiceId/confirm-payment`
**[Admin/Staff]** Xác nhận thanh toán & đánh dấu tình trạng
```json
{
  "paidAmount": 5650000,
  "paymentNotes": "Đã thanh toán qua ngân hàng",
  "status": "paid"
}
```

### GET `/api/invoices/my/list`
**[Tenant]** Xem danh sách hóa đơn của mình (3-4 tháng gần nhất)

### GET `/api/invoices/my/:invoiceId`
**[Tenant]** Xem chi tiết hóa đơn

### GET `/api/invoices/my/payment-history`
**[Tenant]** Xem lịch sử thanh toán

---

## 💳 Payment Management (Thanh toán)

### POST `/api/payments`
**[Admin/Staff]** Ghi nhận thanh toán từ khách
```json
{
  "invoice": "invoice_id",
  "tenant": "tenant_id",
  "amount": 5650000,
  "paymentMethod": "bank-transfer",
  "transactionId": "TRX123456",
  "paymentDate": "2025-01-05"
}
```

### GET `/api/payments`
**[Admin/Staff]** Xem danh sách thanh toán (filter: status, method, date)

### GET `/api/payments/:paymentId`
**[Admin/Staff]** Chi tiết thanh toán

### GET `/api/payments/status/summary`
**[Admin/Staff]** Theo dõi trạng thái thanh toán (paid/partial/unpaid/overdue/missing)

### POST `/api/payments/send-info`
**[Admin/Staff]** Gửi thông tin ngân hàng/MoMo cho khách
```json
{
  "invoice": "invoice_id",
  "bankInfo": "Vietcombank - 123456789",
  "momoInfo": "MoMo - 0987654321"
}
```

### GET `/api/payments/my/history`
**[Tenant]** Xem lịch sử thanh toán

---

## 📊 Utility Reading Management (Chỉ số điện nước)

### POST `/api/utility-readings`
**[Tenant]** Gửi chỉ số điện nước cuối tháng
```json
{
  "month": 1,
  "year": 2025,
  "electricityReading": 1500,
  "waterReading": 45,
  "notes": "Đã kiểm tra lại"
}
```

### GET `/api/utility-readings`
**[Admin/Staff]** Xem danh sách chỉ số chưa xác nhận (filter: month, year, building)

### GET `/api/utility-readings/:readingId`
**[Admin/Staff]** Chi tiết chỉ số

### PUT `/api/utility-readings/:readingId/verify`
**[Admin/Staff]** Xác nhận chỉ số điện nước
```json
{
  "adjustedElectricityUsage": 100,
  "adjustedWaterUsage": 15
}
```

### PUT `/api/utility-readings/:readingId/reject`
**[Admin/Staff]** Từ chối chỉ số (yêu cầu gửi lại)
```json
{
  "reason": "Chỉ số không hợp lý"
}
```

### GET `/api/utility-readings/my/history`
**[Tenant]** Xem lịch sử chỉ số của mình

---

## 🔧 Maintenance Ticket Management (Báo cáo sự cố)

### POST `/api/maintenance-tickets`
**[Tenant]** Báo cáo sự cố
```json
{
  "category": "plumbing|electrical|structural|appliance|ventilation|door-lock|paint|other",
  "priority": "low|medium|high|urgent",
  "title": "Vòi nước rỉ",
  "description": "Chi tiết sự cố...",
  "images": ["url1", "url2"]
}
```

### GET `/api/maintenance-tickets`
**[Admin/Staff]** Xem danh sách sự cố (filter: status, priority, building)

### GET `/api/maintenance-tickets/:ticketId`
**[Admin/Staff]** Chi tiết sự cố

### PUT `/api/maintenance-tickets/:ticketId/assign`
**[Admin/Staff]** Gán sự cố cho nhân viên
```json
{
  "assignedTo": "staff_user_id",
  "estimatedCompletionDate": "2025-01-10"
}
```

### PUT `/api/maintenance-tickets/:ticketId/status`
**[Admin/Staff]** Cập nhật trạng thái sự cố
```json
{
  "status": "new|assigned|in-progress|completed|rejected",
  "notes": "Chi tiết xử lý...",
  "cost": 500000
}
```

### GET `/api/maintenance-tickets/my/tickets`
**[Tenant]** Xem danh sách sự cố của mình

---

## 📄 Document Management (Quản lý giấy tờ)

### POST `/api/documents`
**[Tenant]** Upload giấy tờ
```json
{
  "documentType": "contract|invoice|payment-receipt|id-card|tenant-profile|utility-bill|maintenance-report|other",
  "fileName": "CCCD_A.pdf",
  "fileUrl": "https://storage.example.com/...",
  "fileSize": 1024,
  "mimeType": "application/pdf",
  "expiryDate": "2027-01-01",
  "notes": "CCCD nhân dân"
}
```

### GET `/api/documents`
**[Admin/Staff]** Xem danh sách tài liệu (filter: type, status, building)

### GET `/api/documents/:documentId`
**[Admin/Staff]** Chi tiết tài liệu

### PUT `/api/documents/:documentId/archive`
**[Admin/Staff]** Lưu trữ tài liệu (lưu khoảng 3 tháng)

### DELETE `/api/documents/:documentId`
**[Admin]** Xóa tài liệu

### GET `/api/documents/my/list`
**[Tenant]** Xem danh sách tài liệu của mình

### GET `/api/documents/my/:documentId/download`
**[Tenant]** Download tài liệu

### PUT `/api/documents/:documentId/share`
**[Admin/Staff]** Chia sẻ tài liệu cho khách

---

## 🔔 Notification Management (Thông báo)

### POST `/api/notifications`
**[Admin/Staff]** Tạo & gửi thông báo (có thể gửi theo block/toà nhà/phòng/khách riêng)
```json
{
  "recipients": ["user_id_1", "user_id_2"],
  "notificationType": "invoice-issued|payment-due|payment-received|maintenance-assigned|maintenance-completed|contract-expiring|utility-reading-requested|message|system-alert|other",
  "title": "Tiêu đề thông báo",
  "message": "Nội dung thông báo",
  "actionUrl": "/invoices/123",
  "sendMethod": "in-app|email|sms|push-notification",
  "recipientFilter": {
    "building": "Building A",
    "unit": "A101",
    "block": "Block 1"
  }
}
```

### GET `/api/notifications/sent/list`
**[Admin/Staff]** Xem danh sách thông báo đã gửi (filter: type, deliveryStatus)

### GET `/api/notifications/my/list`
**[Tenant]** Xem thông báo của mình (phân biệt important/regular)

### PUT `/api/notifications/:notificationId/read`
**[Tenant]** Đánh dấu thông báo là đã đọc

### PUT `/api/notifications/my/read-all`
**[Tenant]** Đánh dấu tất cả thông báo là đã đọc

### DELETE `/api/notifications/:notificationId`
**[Tenant]** Xóa thông báo

### GET `/api/notifications/:notificationId`
**[Tenant]** Xem thông báo chi tiết (tự động mark as read)

### GET `/api/notifications/unread/count`
**[User]** Xem số thông báo chưa đọc

---

## 💬 Message Management (Tin nhắn/Chat)

### POST `/api/messages`
**[Tenant/Admin]** Gửi tin nhắn
```json
{
  "recipient": "user_id",
  "content": "Nội dung tin nhắn",
  "messageType": "text|image|file|system",
  "attachments": [
    {
      "fileName": "document.pdf",
      "fileUrl": "https://...",
      "fileSize": 1024,
      "mimeType": "application/pdf"
    }
  ],
  "unit": "unit_id",
  "contract": "contract_id"
}
```

### GET `/api/messages/conversation/:conversationId`
**[Tenant/Admin]** Xem đoạn chat (lịch sử tin nhắn, tự động mark as read)

### GET `/api/messages/my/conversations`
**[Tenant/Admin]** Danh sách conversations (những người đã chat)

### GET `/api/messages/:messageId`
**[Tenant/Admin]** Chi tiết tin nhắn

### PUT `/api/messages/:messageId`
**[Tenant/Admin]** Chỉnh sửa tin nhắn (giữ edit history)

### DELETE `/api/messages/:messageId`
**[Tenant/Admin]** Xóa tin nhắn

### GET `/api/messages/unread/count`
**[Tenant/Admin]** Xem số tin nhắn chưa đọc

### POST `/api/messages/:messageId/attachment`
**[Tenant/Admin]** Tải attachment vào tin nhắn

### GET `/api/messages/admin/all-messages`
**[Admin/Staff]** Xem tất cả đoạn chat (filter: unit, contract)

---

## 👤 User Management

### GET `/api/users`
Xem danh sách người dùng

### GET `/api/users/:userId`
Chi tiết người dùng

### PUT `/api/users/:userId`
Cập nhật thông tin người dùng

### DELETE `/api/users/:userId`
Xóa người dùng

---

## 🔑 Authentication Middleware

Tất cả endpoints (ngoại trừ `/api/auth/signup` và `/api/auth/login`) yêu cầu:
- **Header:** `Authorization: Bearer <JWT_TOKEN>`

**Role-based Access Control:**
- `admin` - Quản trị viên, truy cập toàn bộ hệ thống
- `staff` - Nhân viên, quản lý phòng, khách thuê, hợp đồng
- `tenant` - Khách thuê, xem hóa đơn, gửi chỉ số, báo cáo sự cố

---

## 📊 Data Models Summary

| Model | Mô tả | Trạng thái |
|-------|-------|-----------|
| **User** | Tài khoản người dùng | ✅ Active |
| **Unit** | Phòng/căn hộ | ✅ Active |
| **Tenant** | Hồ sơ khách thuê | ✅ Active |
| **Contract** | Hợp đồng thuê | ✅ Active |
| **Invoice** | Hóa đơn hàng tháng | ✅ Active |
| **Payment** | Thanh toán | ✅ Active |
| **UtilityReading** | Chỉ số điện nước | ✅ Active |
| **MaintenanceTicket** | Báo cáo sự cố | ✅ Active |
| **Document** | Quản lý giấy tờ | ✅ Active |
| **Notification** | Thông báo hệ thống | ✅ Active |
| **Message** | Tin nhắn/Chat | ✅ Active |
| **ActivityLog** | Audit trail | ✅ Active |

---

## ✅ API Status

- **Total Endpoints:** 60+
- **Authentication:** JWT-based
- **Rate Limiting:** To be implemented
- **CORS:** To be configured
- **Documentation:** Complete
- **Tests:** Basic health check ✅

---

## 🚀 Next Steps

1. **User Stories** - Detailed acceptance criteria for each feature
2. **Sprint Planning** - 2-week sprints with task assignments
3. **Agile Metrics** - Velocity, burndown charts, task tracking
4. **Integration Tests** - Test all endpoints with sample data
5. **WebSocket Implementation** - Real-time notifications & chat
6. **Email Integration** - Send payment reminders, receipts
7. **File Upload** - S3/Cloud storage integration
8. **Advanced Reporting** - Payment analytics, tenant history

---

**Generated:** January 2025
**Version:** 1.0.0
