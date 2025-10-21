# 🏢 Apartment Rental Management System API

Hệ thống quản lý chung cư/trọ cho cả chủ nhà và khách thuê.

## 📚 Tài liệu API (Swagger)

**Truy cập Swagger UI tại:** `http://localhost:3000/api-docs`

Swagger UI cung cấp:
- ✅ Danh sách đầy đủ tất cả endpoints
- ✅ Schema của request/response
- ✅ Khả năng test API trực tiếp từ browser
- ✅ Authentication với JWT token
- ✅ Ví dụ cho mỗi endpoint

## 🚀 Khởi động nhanh

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình môi trường
Tạo file `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/apartment-management
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
```

### 3. Khởi động server
```bash
npm start          # Production mode
npm run dev        # Development mode (nodemon)
```

### 4. Test API
```bash
npm test
```

## 📖 Hướng dẫn sử dụng Swagger

### Bước 1: Đăng nhập
1. Mở `http://localhost:3000/api-docs`
2. Tìm endpoint `POST /api/auth/login`
3. Click **"Try it out"**
4. Nhập:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```
5. Click **"Execute"**
6. Copy **token** từ response

### Bước 2: Authenticate
1. Click nút **"Authorize" 🔓** ở góc trên
2. Nhập: `Bearer <your_token_here>`
3. Click **"Authorize"**
4. Click **"Close"**

### Bước 3: Test endpoints
Bây giờ bạn có thể test tất cả các endpoints! Ví dụ:
- Tạo phòng mới: `POST /api/units`
- Xem danh sách phòng: `GET /api/units`
- Tạo hóa đơn: `POST /api/invoices`

## 🎯 Tính năng chính

### 👤 Khách thuê (Tenant)
- ✅ Gửi số điện nước cuối tháng
- ✅ Xem hợp đồng, hóa đơn (3-4 tháng gần nhất)
- ✅ Xem lịch sử thanh toán
- ✅ Báo cáo sự cố (với mức độ ưu tiên)
- ✅ Upload giấy tờ (CCCD, ảnh check-in)
- ✅ Nhận thông báo
- ✅ Chat với chủ nhà

### 🏠 Chủ nhà (Admin/Landlord)
- ✅ Tự động tạo hóa đơn hàng tháng
- ✅ Xác nhận thanh toán, đánh dấu trạng thái
- ✅ Quản lý phòng, toà nhà, khách thuê
- ✅ Lưu bill và ảnh đồng hồ (3 tháng)
- ✅ Gửi thông báo (theo block/toà/phòng/cá nhân)
- ✅ Gửi thông tin ngân hàng, MoMo
- ✅ Quản lý sự cố bảo trì
- ✅ Chat với khách thuê

## 📁 Cấu trúc Project

```
room-management-server/
├── src/
│   ├── config/
│   │   ├── connection.js      # MongoDB connection
│   │   └── swagger.js         # Swagger configuration
│   ├── controllers/           # Business logic (10 controllers)
│   ├── middlewares/
│   │   └── auth.js           # JWT authentication & authorization
│   ├── models/               # Mongoose schemas (12 models)
│   ├── routes/               # API routes (11 route files)
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── tests/                    # Test files
├── .env                      # Environment variables
├── package.json
├── API_DOCUMENTATION.md      # Detailed API docs
├── SWAGGER_GUIDE.md          # Swagger usage guide
└── README.md                 # This file
```

## 🗄️ Models (Data Schema)

1. **User** - Người dùng (admin/staff/tenant)
2. **Unit** - Phòng/căn hộ
3. **Tenant** - Hồ sơ khách thuê
4. **Contract** - Hợp đồng thuê
5. **Invoice** - Hóa đơn thanh toán
6. **Payment** - Ghi nhận thanh toán
7. **UtilityReading** - Chỉ số điện nước
8. **MaintenanceTicket** - Báo cáo sự cố
9. **Document** - Tài liệu/giấy tờ
10. **Notification** - Thông báo
11. **Message** - Tin nhắn/chat
12. **ActivityLog** - Nhật ký hoạt động

## 🔐 Authentication & Authorization

### JWT Token
- Token hết hạn sau **24 giờ**
- Gửi token trong header: `Authorization: Bearer <token>`

### Roles
- **admin**: Toàn quyền quản trị
- **staff**: Hỗ trợ quản lý
- **tenant**: Khách thuê

## 🌐 API Endpoints Summary

| Group | Endpoints | Description |
|-------|-----------|-------------|
| **Auth** | 3 endpoints | Đăng ký, đăng nhập, profile |
| **Units** | 7 endpoints | Quản lý phòng/căn hộ |
| **Tenants** | 7 endpoints | Quản lý khách thuê |
| **Contracts** | 7 endpoints | Quản lý hợp đồng |
| **Invoices** | 7 endpoints | Quản lý hóa đơn |
| **Payments** | 6 endpoints | Quản lý thanh toán |
| **Utility Readings** | 6 endpoints | Quản lý chỉ số điện nước |
| **Maintenance** | 6 endpoints | Quản lý sự cố bảo trì |
| **Documents** | 8 endpoints | Quản lý tài liệu |
| **Notifications** | 8 endpoints | Quản lý thông báo |
| **Messages** | 9 endpoints | Quản lý tin nhắn/chat |
| **Admin** | 5 endpoints | Quản trị hệ thống |

**Tổng cộng:** ~75+ endpoints

## 🧪 Testing

Chạy test suite:
```bash
npm test
```

Hiện tại có:
- Health check test
- (Có thể thêm integration tests cho các endpoints)

## 📦 Dependencies

### Production
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **swagger-jsdoc** - Swagger documentation generator
- **swagger-ui-express** - Swagger UI
- **dotenv** - Environment variables

### Development
- **nodemon** - Auto-restart server
- **supertest** - API testing

## 🔧 Môi trường Development

### Yêu cầu
- Node.js >= 18.x
- MongoDB >= 5.x
- npm hoặc yarn

### Setup MongoDB
```bash
# Local MongoDB
mongod --dbpath /path/to/data

# Hoặc dùng MongoDB Atlas (cloud)
# Cập nhật MONGODB_URI trong .env
```

## 📊 API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "Detailed error description"
}
```

## 🚦 Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized (chưa đăng nhập)
- **403** - Forbidden (không có quyền)
- **404** - Not Found
- **500** - Internal Server Error

## 📝 Workflow Examples

### Quy trình tạo hợp đồng mới
1. Admin tạo unit: `POST /api/units`
2. Admin tạo tenant profile: `POST /api/tenants`
3. Admin tạo contract: `POST /api/contracts`
4. Admin ký contract: `PUT /api/contracts/:id/sign`
5. Hệ thống tự động update unit status → "occupied"

### Quy trình thanh toán hàng tháng
1. Admin tạo invoice: `POST /api/invoices`
2. Tenant nhận notification tự động
3. Tenant xem invoice: `GET /api/invoices/my/list`
4. Tenant chuyển tiền
5. Admin confirm payment: `PUT /api/invoices/:id/confirm-payment`
6. Tenant nhận notification xác nhận

### Quy trình gửi chỉ số điện nước
1. Tenant gửi reading: `POST /api/utility-readings`
2. Admin nhận notification
3. Admin verify: `PUT /api/utility-readings/:id/verify`
4. Hệ thống dùng reading để tạo invoice tháng sau

## 🔗 Useful Links

- **Swagger UI:** http://localhost:3000/api-docs
- **API JSON:** http://localhost:3000/api-docs.json
- **Health Check:** http://localhost:3000/health

## 👥 Team

- **Backend Developer:** Ân, Việt, Nguyên
- **Frontend Developer:** (Đang phát triển giao diện)

## 📄 License

MIT License

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Kiểm tra [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)
3. Xem Swagger UI tại http://localhost:3000/api-docs
4. Tạo issue trên GitHub

---

**Made with ❤️ for Apartment Management**
