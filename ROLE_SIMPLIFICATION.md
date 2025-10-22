# 🔐 ROLE SIMPLIFICATION - HỆ THỐNG 2 VAI TRÒ

## ✅ Thay đổi: Từ 3 roles → 2 roles

### Trước đây (3 roles):
- `admin` - Quản trị viên
- `staff` - Nhân viên (BỊ XÓA)
- `tenant` - Khách thuê

### Hiện tại (2 roles):
- `admin` - Quản trị viên (có tất cả quyền)
- `tenant` - Khách thuê (quyền hạn chế)

---

## 📝 Các file đã cập nhật:

### 1. **Models**
- ✅ `src/models/user.js`
  - Roles: `['admin', 'tenant']`
  - Default role: `'tenant'`

### 2. **Controllers**
- ✅ `src/controllers/authController.js` - Default role khi signup: `'tenant'`
- ✅ `src/controllers/adminController.js` - Validation chỉ cho phép `admin` hoặc `tenant`

### 3. **Routes** (Tất cả `authorize(['admin', 'staff'])` → `authorize(['admin'])`)
- ✅ `src/routes/authRoute.js` - Swagger enum updated
- ✅ `src/routes/unitRoute.js` - 4 endpoints
- ✅ `src/routes/tenantRoute.js` - 4 endpoints
- ✅ `src/routes/contractRoute.js` - 2 endpoints
- ✅ `src/routes/invoiceRoute.js` - 3 endpoints
- ✅ `src/routes/paymentRoute.js` - 4 endpoints
- ✅ `src/routes/utilityReadingRoute.js` - 3 endpoints
- ✅ `src/routes/maintenanceTicketRoute.js` - 3 endpoints
- ✅ `src/routes/documentRoute.js` - 3 endpoints
- ✅ `src/routes/notificationRoute.js` - 2 endpoints
- ✅ `src/routes/messageRoute.js` - 1 endpoint

---

## 🎯 Phân quyền sau khi thay đổi:

### **Admin** có thể:
✅ Tạo, xem, sửa, xóa căn hộ (units)
✅ Quản lý khách thuê (tenants)
✅ Tạo và quản lý hợp đồng (contracts)
✅ Tạo hóa đơn và xác nhận thanh toán (invoices)
✅ Ghi nhận thanh toán (payments)
✅ Xác nhận/từ chối chỉ số điện nước (utility readings)
✅ Xem và xử lý yêu cầu sửa chữa (maintenance tickets)
✅ Quản lý tài liệu (documents)
✅ Gửi thông báo (notifications)
✅ Xem tất cả tin nhắn (messages)

### **Tenant** (Khách thuê) có thể:
✅ Xem hồ sơ của mình (`/my-profile`)
✅ Xem hợp đồng hiện tại và lịch sử (`/my/current`, `/my/history`)
✅ Xem hóa đơn của mình (`/my/list`)
✅ Xem lịch sử thanh toán (`/my/payment-history`)
✅ Gửi chỉ số điện nước
✅ Xem lịch sử chỉ số (`/my/history`)
✅ Tạo yêu cầu sửa chữa
✅ Xem danh sách sự cố của mình (`/my/tickets`)
✅ Upload tài liệu
✅ Xem và download tài liệu của mình
✅ Nhận và đọc thông báo
✅ Gửi và nhận tin nhắn

---

## 🔧 BUG FIX: Role "student" → "tenant"

### Vấn đề trước đây:
- User model có role `'student'` (sai!)
- Các routes và authorization dùng `'tenant'`
- → Không thể đăng ký vì role không khớp!

### Đã sửa:
```javascript
// TRƯỚC (SAI):
const roles = ['admin', 'staff', 'student'];
role: role || 'student'

// SAU (ĐÚNG):
const roles = ['admin', 'tenant'];
role: role || 'tenant'
```

---

## 📋 Test đăng ký:

### Đăng ký Admin:
```json
POST /api/auth/signup
{
  "fullName": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

### Đăng ký Tenant (mặc định):
```json
POST /api/auth/signup
{
  "fullName": "Nguyen Van A",
  "email": "tenant@example.com",
  "password": "password123"
  // role tự động = "tenant"
}
```

---

## ✨ Lợi ích của việc đơn giản hóa:

1. **Dễ hiểu hơn** - Chỉ 2 vai trò: admin và khách thuê
2. **Bảo mật tốt hơn** - Phân quyền rõ ràng, ít rủi ro
3. **Dễ maintain** - Ít code hơn, ít bug hơn
4. **Phù hợp hơn** - Hệ thống quản lý phòng trọ thường chỉ cần 2 roles

---

## 🚀 Kết luận:

Hệ thống giờ đây **HOÀN TOÀN HOẠT ĐỘNG** với 2 vai trò:
- ✅ Admin: Quản lý toàn bộ hệ thống
- ✅ Tenant: Xem và quản lý thông tin cá nhân

**ĐĂNG KÝ BÂY GIỜ ĐÃ HOẠT ĐỘNG BÌNH THƯỜNG!** 🎉
