# Swagger API Documentation Setup

## Truy cập Swagger UI

Sau khi khởi động server, truy cập:

```
http://localhost:3000/api-docs
```

## Các endpoint chính

### 1. Authentication
- `POST /api/auth/signup` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập, nhận JWT token
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### 2. Units (Quản lý phòng)
- `POST /api/units` - Tạo phòng mới
- `GET /api/units` - Danh sách phòng (có filter)
- `GET /api/units/:unitId` - Chi tiết phòng
- `PUT /api/units/:unitId` - Cập nhật phòng
- `DELETE /api/units/:unitId` - Xóa phòng
- `GET /api/units/available/listing` - Phòng trống

### 3. Tenants (Quản lý khách thuê)
- `POST /api/tenants` - Tạo hồ sơ khách thuê
- `GET /api/tenants` - Danh sách khách thuê
- `GET /api/tenants/:tenantId` - Chi tiết khách thuê
- `GET /api/tenants/my-profile` - Xem hồ sơ (tenant)
- `PUT /api/tenants/my-profile/emergency-contact` - Cập nhật liên hệ khẩn cấp

### 4. Contracts (Hợp đồng)
- `POST /api/contracts` - Tạo hợp đồng
- `GET /api/contracts` - Danh sách hợp đồng
- `GET /api/contracts/:contractId` - Chi tiết hợp đồng
- `PUT /api/contracts/:contractId/sign` - Ký hợp đồng
- `GET /api/contracts/my/current` - Xem hợp đồng hiện tại (tenant)

### 5. Invoices (Hóa đơn)
- `POST /api/invoices` - Tạo hóa đơn
- `GET /api/invoices` - Danh sách hóa đơn
- `GET /api/invoices/:invoiceId` - Chi tiết hóa đơn
- `PUT /api/invoices/:invoiceId/confirm-payment` - Xác nhận thanh toán
- `GET /api/invoices/my/list` - Xem hóa đơn của mình (tenant)
- `GET /api/invoices/my/payment-history` - Lịch sử thanh toán (tenant)

### 6. Utility Readings (Chỉ số điện nước)
- `POST /api/utility-readings` - Gửi chỉ số (tenant)
- `GET /api/utility-readings` - Danh sách chỉ số chưa xác nhận
- `PUT /api/utility-readings/:readingId/verify` - Xác nhận chỉ số
- `PUT /api/utility-readings/:readingId/reject` - Từ chối chỉ số
- `GET /api/utility-readings/my/history` - Lịch sử chỉ số (tenant)

### 7. Maintenance Tickets (Báo cáo sự cố)
- `POST /api/maintenance-tickets` - Báo cáo sự cố (tenant)
- `GET /api/maintenance-tickets` - Danh sách sự cố
- `PUT /api/maintenance-tickets/:ticketId/assign` - Gán sự cố cho staff
- `PUT /api/maintenance-tickets/:ticketId/status` - Cập nhật trạng thái
- `GET /api/maintenance-tickets/my/tickets` - Sự cố của mình (tenant)

### 8. Documents (Tài liệu)
- `POST /api/documents` - Upload tài liệu (tenant)
- `GET /api/documents` - Danh sách tài liệu
- `GET /api/documents/my/list` - Tài liệu của mình (tenant)
- `PUT /api/documents/:documentId/share` - Chia sẻ tài liệu

### 9. Notifications (Thông báo)
- `POST /api/notifications` - Gửi thông báo (admin)
- `GET /api/notifications/my/list` - Thông báo của mình
- `PUT /api/notifications/:notificationId/read` - Đánh dấu đã đọc
- `GET /api/notifications/unread/count` - Số thông báo chưa đọc

### 10. Messages (Tin nhắn/Chat)
- `POST /api/messages` - Gửi tin nhắn
- `GET /api/messages/conversation/:conversationId` - Lịch sử chat
- `GET /api/messages/my/conversations` - Danh sách cuộc trò chuyện
- `GET /api/messages/unread/count` - Số tin nhắn chưa đọc

### 11. Payments (Thanh toán)
- `POST /api/payments` - Ghi nhận thanh toán
- `GET /api/payments` - Danh sách thanh toán
- `GET /api/payments/status/summary` - Tóm tắt trạng thái thanh toán
- `POST /api/payments/send-info` - Gửi thông tin ngân hàng/MoMo
- `GET /api/payments/my/history` - Lịch sử thanh toán (tenant)

## Cách sử dụng Swagger UI

### 1. Login và lấy token
1. Truy cập `http://localhost:3000/api-docs`
2. Tìm endpoint `POST /api/auth/login`
3. Click "Try it out"
4. Nhập email và password
5. Click "Execute"
6. Copy JWT token từ response

### 2. Authorize
1. Click nút "Authorize" ở góc trên bên phải
2. Nhập: `Bearer <your_token>`
3. Click "Authorize"
4. Bây giờ bạn có thể test các endpoint yêu cầu authentication

### 3. Test các endpoints
- Mỗi endpoint có form "Try it out"
- Điền parameters/body theo schema
- Click "Execute" để test
- Xem response bên dưới

## Roles và Permissions

### Admin/Staff có thể:
- Quản lý phòng (CRUD)
- Quản lý khách thuê
- Tạo hợp đồng, ký hợp đồng
- Tạo hóa đơn, xác nhận thanh toán
- Xác nhận chỉ số điện nước
- Quản lý sự cố bảo trì
- Gửi thông báo
- Xem tất cả dữ liệu

### Tenant có thể:
- Xem hồ sơ của mình
- Xem phòng mình đang thuê
- Xem hợp đồng, hóa đơn
- Gửi chỉ số điện nước
- Báo cáo sự cố
- Upload tài liệu
- Nhận thông báo
- Chat với chủ nhà
- Xem lịch sử thanh toán

## Swagger JSON

Để lấy OpenAPI spec dạng JSON:
```
http://localhost:3000/api-docs.json
```

## Tích hợp với tools khác

### Postman
1. Trong Postman, click Import
2. Nhập URL: `http://localhost:3000/api-docs.json`
3. Tất cả endpoints sẽ được import tự động

### Insomnia
1. Click Create → Import from URL
2. Nhập: `http://localhost:3000/api-docs.json`

## Custom Swagger UI

Để customize giao diện Swagger UI, chỉnh sửa trong `src/app.js`:

```javascript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Your Custom Title',
  customfavIcon: '/path/to/favicon.ico'
}));
```

## Môi trường Production

Trong production, có thể:
1. Disable Swagger UI hoàn toàn
2. Yêu cầu authentication để truy cập /api-docs
3. Chỉ cho phép admin truy cập

```javascript
if (process.env.NODE_ENV === 'production') {
  // Disable hoặc protect Swagger UI
  app.use('/api-docs', authenticateToken, authorize(['admin']), 
    swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```
