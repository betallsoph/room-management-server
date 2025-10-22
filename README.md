# 🏠 Room Management Server API# 🏢 Apartment Rental Management System API



> Complete REST API for Apartment/Room Rental Management SystemHệ thống quản lý chung cư/trọ cho cả chủ nhà và khách thuê.



[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)## 📚 Tài liệu API (Swagger)

[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)

[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-brightgreen.svg)](https://www.mongodb.com/)**Truy cập Swagger UI tại:** `http://localhost:3000/api-docs`

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Swagger UI cung cấp:

## 📋 Features- ✅ Danh sách đầy đủ tất cả endpoints

- ✅ Schema của request/response

- ✅ **User Management** - Admin, Staff, Tenant roles with JWT authentication- ✅ Khả năng test API trực tiếp từ browser

- ✅ **Unit Management** - Apartments/rooms with availability tracking- ✅ Authentication với JWT token

- ✅ **Tenant Management** - Complete tenant profiles and documents- ✅ Ví dụ cho mỗi endpoint

- ✅ **Contract Management** - Lease agreements with digital signing

- ✅ **Invoice & Payment** - Automated billing and payment tracking## 🚀 Khởi động nhanh

- ✅ **Utility Readings** - Electric and water meter management

- ✅ **Maintenance Tickets** - Repair request system with status tracking### 1. Cài đặt dependencies

- ✅ **Notifications** - Real-time notifications for tenants and staff```bash

- ✅ **Messaging** - Built-in chat systemnpm install

- ✅ **Activity Logs** - Complete audit trail```

- ✅ **Swagger Documentation** - Interactive API documentation

### 2. Cấu hình môi trường

## 🚀 Quick StartTạo file `.env`:

```env

### PrerequisitesPORT=3000

MONGODB_URI=mongodb://localhost:27017/apartment-management

- Node.js 18+JWT_SECRET=your_secret_key_here

- MongoDB 4.4+JWT_EXPIRES_IN=24h

- npm or yarn```



### Installation### 3. Khởi động server

```bash

```bashnpm start          # Production mode

# Clone repositorynpm run dev        # Development mode (nodemon)

git clone https://github.com/betallsoph/room-management-server.git```

cd room-management-server

### 4. Test API

# Install dependencies```bash

npm installnpm test

```

# Setup environment

cp .env.example .env## 📖 Hướng dẫn sử dụng Swagger

# Edit .env with your configuration

### Bước 1: Đăng nhập

# Start server1. Mở `http://localhost:3000/api-docs`

npm start2. Tìm endpoint `POST /api/auth/login`

3. Click **"Try it out"**

# Development mode (with auto-reload)4. Nhập:

npm run dev   ```json

```   {

     "email": "admin@example.com",

Server will run at `http://localhost:3000`     "password": "admin123"

   }

## 📡 API Documentation   ```

5. Click **"Execute"**

### Swagger UI6. Copy **token** từ response

Interactive API documentation with testing capabilities:

```### Bước 2: Authenticate

http://localhost:3000/api-docs1. Click nút **"Authorize" 🔓** ở góc trên

```2. Nhập: `Bearer <your_token_here>`

3. Click **"Authorize"**

### OpenAPI Specification4. Click **"Close"**

```

http://localhost:3000/api-docs.json### Bước 3: Test endpoints

```Bây giờ bạn có thể test tất cả các endpoints! Ví dụ:

- Tạo phòng mới: `POST /api/units`

## 🔐 Authentication- Xem danh sách phòng: `GET /api/units`

- Tạo hóa đơn: `POST /api/invoices`

### Register

```http## 🎯 Tính năng chính

POST /api/auth/signup

Content-Type: application/json### 👤 Khách thuê (Tenant)

- ✅ Gửi số điện nước cuối tháng

{- ✅ Xem hợp đồng, hóa đơn (3-4 tháng gần nhất)

  "fullName": "John Doe",- ✅ Xem lịch sử thanh toán

  "email": "john@example.com",- ✅ Báo cáo sự cố (với mức độ ưu tiên)

  "password": "password123",- ✅ Upload giấy tờ (CCCD, ảnh check-in)

  "role": "tenant"- ✅ Nhận thông báo

}- ✅ Chat với chủ nhà

```

### 🏠 Chủ nhà (Admin/Landlord)

### Login- ✅ Tự động tạo hóa đơn hàng tháng

```http- ✅ Xác nhận thanh toán, đánh dấu trạng thái

POST /api/auth/login- ✅ Quản lý phòng, toà nhà, khách thuê

Content-Type: application/json- ✅ Lưu bill và ảnh đồng hồ (3 tháng)

- ✅ Gửi thông báo (theo block/toà/phòng/cá nhân)

{- ✅ Gửi thông tin ngân hàng, MoMo

  "email": "john@example.com",- ✅ Quản lý sự cố bảo trì

  "password": "password123"- ✅ Chat với khách thuê

}

```## 📁 Cấu trúc Project



**Response:**```

```jsonroom-management-server/

{├── src/

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",│   ├── config/

  "user": {│   │   ├── connection.js      # MongoDB connection

    "userId": "507f1f77bcf86cd799439011",│   │   └── swagger.js         # Swagger configuration

    "email": "john@example.com",│   ├── controllers/           # Business logic (10 controllers)

    "role": "tenant",│   ├── middlewares/

    "fullName": "John Doe"│   │   └── auth.js           # JWT authentication & authorization

  }│   ├── models/               # Mongoose schemas (12 models)

}│   ├── routes/               # API routes (11 route files)

```│   ├── app.js                # Express app setup

│   └── server.js             # Server entry point

### Using the token├── tests/                    # Test files

```http├── .env                      # Environment variables

Authorization: Bearer <your-jwt-token>├── package.json

```├── API_DOCUMENTATION.md      # Detailed API docs

├── SWAGGER_GUIDE.md          # Swagger usage guide

## 👥 User Roles└── README.md                 # This file

```

| Role | Permissions |

|------|-------------|## 🗄️ Models (Data Schema)

| **Admin** | Full system access, manage users, delete data, view all reports |

| **Staff** | Manage tenants, units, contracts, handle maintenance, confirm payments |1. **User** - Người dùng (admin/staff/tenant)

| **Tenant** | View own profile, contracts, invoices, submit utility readings, create maintenance tickets |2. **Unit** - Phòng/căn hộ

3. **Tenant** - Hồ sơ khách thuê

## 📊 API Endpoints (97 total)4. **Contract** - Hợp đồng thuê

5. **Invoice** - Hóa đơn thanh toán

### 🔐 Authentication (3)6. **Payment** - Ghi nhận thanh toán

- POST `/api/auth/signup` - Register7. **UtilityReading** - Chỉ số điện nước

- POST `/api/auth/login` - Login8. **MaintenanceTicket** - Báo cáo sự cố

- GET `/api/auth/me` - Get current user9. **Document** - Tài liệu/giấy tờ

10. **Notification** - Thông báo

### 🏠 Units (7)11. **Message** - Tin nhắn/chat

- GET `/api/units` - List units12. **ActivityLog** - Nhật ký hoạt động

- POST `/api/units` - Create unit

- GET `/api/units/available/listing` - Available units## 🔐 Authentication & Authorization

- GET `/api/units/:id` - Unit details

- PUT `/api/units/:id` - Update unit### JWT Token

- DELETE `/api/units/:id` - Delete unit- Token hết hạn sau **24 giờ**

- GET `/api/units/:id/my-unit` - Tenant's unit- Gửi token trong header: `Authorization: Bearer <token>`



### 👥 Tenants (7)### Roles

- GET `/api/tenants` - List tenants- **admin**: Toàn quyền quản trị

- POST `/api/tenants` - Create tenant- **staff**: Hỗ trợ quản lý

- GET `/api/tenants/my-profile` - My profile- **tenant**: Khách thuê

- GET `/api/tenants/:id` - Tenant details

- PUT `/api/tenants/:id` - Update tenant## 🌐 API Endpoints Summary

- PUT `/api/tenants/my-profile/emergency-contact` - Update contact

- PUT `/api/tenants/:id/moved-out` - Mark moved out| Group | Endpoints | Description |

|-------|-----------|-------------|

### 📄 Contracts (7)| **Auth** | 3 endpoints | Đăng ký, đăng nhập, profile |

- GET `/api/contracts` - List contracts| **Units** | 7 endpoints | Quản lý phòng/căn hộ |

- POST `/api/contracts` - Create contract| **Tenants** | 7 endpoints | Quản lý khách thuê |

- GET `/api/contracts/my/current` - Current contract| **Contracts** | 7 endpoints | Quản lý hợp đồng |

- GET `/api/contracts/my/history` - Contract history| **Invoices** | 7 endpoints | Quản lý hóa đơn |

- GET `/api/contracts/:id` - Contract details| **Payments** | 6 endpoints | Quản lý thanh toán |

- PUT `/api/contracts/:id/sign` - Sign contract| **Utility Readings** | 6 endpoints | Quản lý chỉ số điện nước |

- PUT `/api/contracts/:id/terminate` - Terminate| **Maintenance** | 6 endpoints | Quản lý sự cố bảo trì |

| **Documents** | 8 endpoints | Quản lý tài liệu |

### 💰 Invoices (7)| **Notifications** | 8 endpoints | Quản lý thông báo |

- GET `/api/invoices` - List invoices| **Messages** | 9 endpoints | Quản lý tin nhắn/chat |

- POST `/api/invoices` - Create invoice| **Admin** | 5 endpoints | Quản trị hệ thống |

- GET `/api/invoices/my/list` - My invoices

- GET `/api/invoices/my/payment-history` - Payment history**Tổng cộng:** ~75+ endpoints

- GET `/api/invoices/my/:id` - Invoice details (tenant)

- GET `/api/invoices/:id` - Invoice details## 🧪 Testing

- PUT `/api/invoices/:id/confirm-payment` - Confirm payment

Chạy test suite:

### 💳 Payments (6)```bash

- GET `/api/payments` - List paymentsnpm test

- POST `/api/payments` - Record payment```

- GET `/api/payments/my/history` - Payment history

- GET `/api/payments/status/summary` - Payment summaryHiện tại có:

- GET `/api/payments/:id` - Payment details- Health check test

- POST `/api/payments/send-info` - Send payment info- (Có thể thêm integration tests cho các endpoints)



### ⚡ Utility Readings (6)## 📦 Dependencies

- GET `/api/utility-readings` - List readings

- POST `/api/utility-readings` - Submit reading### Production

- GET `/api/utility-readings/my/history` - My readings- **express** - Web framework

- GET `/api/utility-readings/:id` - Reading details- **mongoose** - MongoDB ODM

- PUT `/api/utility-readings/:id/verify` - Verify- **bcryptjs** - Password hashing

- PUT `/api/utility-readings/:id/reject` - Reject- **jsonwebtoken** - JWT authentication

- **swagger-jsdoc** - Swagger documentation generator

### 🔧 Maintenance (6)- **swagger-ui-express** - Swagger UI

- GET `/api/maintenance-tickets` - List tickets- **dotenv** - Environment variables

- POST `/api/maintenance-tickets` - Create ticket

- GET `/api/maintenance-tickets/my/tickets` - My tickets### Development

- GET `/api/maintenance-tickets/:id` - Ticket details- **nodemon** - Auto-restart server

- PUT `/api/maintenance-tickets/:id/assign` - Assign staff- **supertest** - API testing

- PUT `/api/maintenance-tickets/:id/status` - Update status

## 🔧 Môi trường Development

### 📁 Documents (8)

- GET `/api/documents` - List documents### Yêu cầu

- POST `/api/documents` - Upload document- Node.js >= 18.x

- GET `/api/documents/my/list` - My documents- MongoDB >= 5.x

- GET `/api/documents/my/:id/download` - Download- npm hoặc yarn

- GET `/api/documents/:id` - Document details

- PUT `/api/documents/:id/archive` - Archive### Setup MongoDB

- DELETE `/api/documents/:id` - Delete```bash

- PUT `/api/documents/:id/share` - Share# Local MongoDB

mongod --dbpath /path/to/data

### 🔔 Notifications (8)

- POST `/api/notifications` - Send notification# Hoặc dùng MongoDB Atlas (cloud)

- GET `/api/notifications/sent/list` - Sent list# Cập nhật MONGODB_URI trong .env

- GET `/api/notifications/my/list` - My notifications```

- GET `/api/notifications/unread/count` - Unread count

- GET `/api/notifications/:id` - Notification details## 📊 API Response Format

- PUT `/api/notifications/:id/read` - Mark as read

- PUT `/api/notifications/my/read-all` - Mark all read### Success Response

- DELETE `/api/notifications/:id` - Delete```json

{

### 💬 Messages (9)  "message": "Success message",

- POST `/api/messages` - Send message  "data": { ... },

- GET `/api/messages/my/conversations` - My conversations  "pagination": {

- GET `/api/messages/unread/count` - Unread count    "total": 100,

- GET `/api/messages/conversation/:id` - Conversation    "page": 1,

- GET `/api/messages/admin/all-messages` - All messages    "limit": 20,

- GET `/api/messages/:id` - Message details    "pages": 5

- PUT `/api/messages/:id` - Edit message  }

- DELETE `/api/messages/:id` - Delete message}

- POST `/api/messages/:id/attachment` - Upload attachment```



## 🗄️ Database Models### Error Response

```json

| Model | Description |{

|-------|-------------|  "message": "Error message",

| User | User accounts |  "error": "Detailed error description"

| Tenant | Tenant profiles |}

| Unit | Apartments/rooms |```

| Contract | Lease agreements |

| Invoice | Billing |## 🚦 Status Codes

| Payment | Payment records |

| UtilityReading | Meter readings |- **200** - Success

| MaintenanceTicket | Repair requests |- **201** - Created

| Document | File metadata |- **400** - Bad Request

| Notification | Notifications |- **401** - Unauthorized (chưa đăng nhập)

| Message | Chat messages |- **403** - Forbidden (không có quyền)

| ActivityLog | Audit logs |- **404** - Not Found

- **500** - Internal Server Error

## 🛠️ Tech Stack

## 📝 Workflow Examples

- **Node.js** 18+ - Runtime

- **Express.js** 5.x - Web framework### Quy trình tạo hợp đồng mới

- **MongoDB** 8.x - Database1. Admin tạo unit: `POST /api/units`

- **Mongoose** - ODM2. Admin tạo tenant profile: `POST /api/tenants`

- **JWT** - Authentication3. Admin tạo contract: `POST /api/contracts`

- **bcryptjs** - Password hashing4. Admin ký contract: `PUT /api/contracts/:id/sign`

- **Swagger** - API documentation5. Hệ thống tự động update unit status → "occupied"



## ⚙️ Environment Variables### Quy trình thanh toán hàng tháng

1. Admin tạo invoice: `POST /api/invoices`

```env2. Tenant nhận notification tự động

# Server3. Tenant xem invoice: `GET /api/invoices/my/list`

PORT=30004. Tenant chuyển tiền

NODE_ENV=development5. Admin confirm payment: `PUT /api/invoices/:id/confirm-payment`

6. Tenant nhận notification xác nhận

# MongoDB

MONGO_URI=mongodb://127.0.0.1:27017/room_management### Quy trình gửi chỉ số điện nước

1. Tenant gửi reading: `POST /api/utility-readings`

# JWT2. Admin nhận notification

JWT_SECRET=your-secret-key3. Admin verify: `PUT /api/utility-readings/:id/verify`

JWT_EXPIRE=24h4. Hệ thống dùng reading để tạo invoice tháng sau

```

## 🔗 Useful Links

## 📁 Project Structure

- **Swagger UI:** http://localhost:3000/api-docs

```- **API JSON:** http://localhost:3000/api-docs.json

room-management-server/- **Health Check:** http://localhost:3000/health

├── src/

│   ├── config/          # Configuration## 👥 Team

│   ├── controllers/     # Route controllers

│   ├── middlewares/     # Custom middlewares- **Backend Developer:** Ân, Việt, Nguyên

│   ├── models/          # Mongoose models- **Frontend Developer:** (Đang phát triển giao diện)

│   ├── routes/          # API routes

│   ├── app.js           # Express app## 📄 License

│   └── server.js        # Entry point

├── tests/               # TestsMIT License

├── .env.example

├── package.json## 🤝 Contributing

└── README.md

```1. Fork repository

2. Create feature branch: `git checkout -b feature/amazing-feature`

## 🧪 Testing3. Commit changes: `git commit -m 'Add amazing feature'`

4. Push to branch: `git push origin feature/amazing-feature`

```bash5. Open Pull Request

npm test

```## 📞 Support



## 🐛 TroubleshootingNếu gặp vấn đề, vui lòng:

1. Kiểm tra [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Port already in use:**2. Kiểm tra [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

```bash3. Xem Swagger UI tại http://localhost:3000/api-docs

# Windows4. Tạo issue trên GitHub

netstat -ano | findstr :3000

taskkill /F /PID <PID>---



# Linux/Mac**Made with ❤️ for Apartment Management**

lsof -ti:3000 | xargs kill -9
```

**MongoDB connection failed:**
- Check MongoDB is running
- Verify MONGO_URI in .env
- Check network connectivity

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Feel free to submit a Pull Request.

---

Built with ❤️ using Node.js, Express, and MongoDB
