# HỆ THỐNG QUẢN LÝ PHÒNG TRỌ - TÍNH NĂNG

## 📋 TỔNG QUAN

Hệ thống quản lý phòng trọ toàn diện với 2 vai trò chính: **Admin** và **Tenant** (Người thuê), được xây dựng với kiến trúc Neobrutalism design.

### Tech Stack
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: Next.js 14 + TypeScript + React 18
- **Authentication**: JWT (JSON Web Token)
- **Database**: MongoDB với Mongoose ODM
- **Styling**: Tailwind CSS + Neobrutalism Design

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Đăng Nhập (Login)
- ✅ Email validation
- ✅ Password validation (min 6 ký tự)
- ✅ Remember me (lưu vào localStorage hoặc sessionStorage)
- ✅ Phân quyền tự động (Admin → `/admin`, Tenant → `/tenant/dashboard`)
- ✅ Token-based authentication (JWT)
- ✅ Error handling và success messages

### Đăng Ký (Signup)
- ✅ Full name validation
- ✅ Email validation (unique)
- ✅ Password confirmation
- ✅ Phone number validation
- ✅ Auto redirect sau khi đăng ký thành công
- ✅ Tự động tạo tenant role

### Bảo Mật
- ✅ Password hashing với bcrypt
- ✅ JWT token với expiration (24h)
- ✅ Protected routes với middleware authentication
- ✅ Role-based access control (Admin/Tenant)

---

## 👨‍💼 CHỨC NĂNG ADMIN

### 1. Dashboard (Bảng Điều Khiển)
#### Tổng Quan Thống Kê
- 📊 Tổng số phòng (Total Units)
- 📊 Phòng đang cho thuê (Occupied Units)
- 📊 Phòng trống (Available Units)
- 📊 Tổng người thuê (Total Tenants)
- 📊 Doanh thu tháng này (Current Month Revenue)
- 📊 Tỷ lệ lấp đầy (Occupancy Rate)

#### Thông Tin Chi Tiết
- 📈 Biểu đồ phân bố phòng theo tòa nhà
- 📈 Danh sách phòng trống
- 📈 Thanh toán gần đây
- 📈 Yêu cầu bảo trì đang chờ

#### UI Features
- ✨ Compact design với spacing tối ưu
- ✨ Color-coded status badges
- ✨ Responsive grid layout
- ✨ Real-time data loading
- ✨ Hover effects trên cards

### 2. Quản Lý Phòng (Rooms Management)
#### Danh Sách Phòng
- 📋 View all units với pagination
- 🔍 Search theo số phòng, tòa nhà
- 🏷️ Filter theo:
  - Trạng thái (Vacant/Occupied/Maintenance)
  - Tòa nhà (A/B/C)
  - Loại phòng (Studio/1BR/2BR)
- 📊 Sort theo giá, diện tích

#### Thông Tin Phòng
- 🏠 Số phòng & tòa nhà
- 📐 Diện tích (m²)
- 💰 Giá thuê (VNĐ/tháng)
- 💵 Tiền cọc
- 🔑 Trạng thái (Vacant/Occupied/Maintenance)
- 🛏️ Loại phòng (Studio/1 phòng ngủ/2 phòng ngủ)
- 👤 Thông tin người thuê (nếu có)

#### Actions
- ➕ Thêm phòng mới
- ✏️ Chỉnh sửa thông tin phòng
- 🗑️ Xóa phòng (với confirmation)
- 🔄 Cập nhật trạng thái
- 👁️ Xem chi tiết

### 3. Quản Lý Người Thuê (Tenants Management)
#### Danh Sách Người Thuê
- 📋 View all tenants với pagination
- 🔍 Search theo tên, email, số điện thoại
- 🏷️ Filter theo:
  - Trạng thái (Active/Inactive/Pending)
  - Phòng hiện tại
  - Ngày thuê

#### Thông Tin Người Thuê
- 👤 Họ tên đầy đủ
- 📧 Email
- 📱 Số điện thoại
- 🏠 Phòng hiện tại
- 📅 Ngày bắt đầu thuê
- 📅 Ngày kết thúc hợp đồng
- 💰 Tiền cọc
- 📊 Trạng thái (Active/Inactive)

#### Actions
- ➕ Thêm người thuê mới
- ✏️ Chỉnh sửa thông tin
- 🏠 Gán phòng cho người thuê
- 📝 Tạo hợp đồng
- 🗑️ Xóa người thuê
- 👁️ Xem lịch sử thanh toán

### 4. Quản Lý Hóa Đơn (Invoices Management)
#### Danh Sách Hóa Đơn
- 📋 View all invoices với pagination
- 🔍 Search theo mã hóa đơn, tháng
- 🏷️ Filter theo:
  - Trạng thái (Draft/Issued/Paid/Overdue)
  - Tháng/Năm
  - Người thuê

#### Thông Tin Hóa Đơn
- 🔢 Mã hóa đơn
- 👤 Thông tin người thuê
- 🏠 Phòng
- 📅 Tháng/Năm
- 💰 Tiền phòng
- ⚡ Tiền điện (số cũ/mới, đơn giá)
- 💧 Tiền nước (số cũ/mới, đơn giá)
- 🌐 Tiền internet
- 🧹 Phí dịch vụ
- 💵 Tổng cộng
- 📅 Hạn thanh toán
- 📊 Trạng thái

#### Actions
- ➕ Tạo hóa đơn mới (auto-generate cho tháng hiện tại)
- ✏️ Chỉnh sửa hóa đơn
- 📧 Gửi hóa đơn qua email
- ✅ Xác nhận thanh toán
- 🖨️ In hóa đơn
- 🗑️ Xóa hóa đơn

### 5. Quản Lý Bảo Trì (Maintenance Management)
#### Danh Sách Yêu Cầu
- 📋 View all maintenance tickets
- 🔍 Search theo tiêu đề, người thuê
- 🏷️ Filter theo:
  - Trạng thái (New/Assigned/In Progress/Completed/Cancelled)
  - Mức độ ưu tiên (Urgent/High/Medium/Low)
  - Danh mục (Plumbing/Electrical/Structural/etc.)

#### Thông Tin Yêu Cầu
- 📝 Tiêu đề
- 📄 Mô tả chi tiết
- 👤 Người yêu cầu (tenant)
- 🏠 Phòng
- 🏷️ Danh mục
- ⚠️ Mức độ ưu tiên
- 📅 Ngày tạo
- 📅 Ngày hoàn thành (nếu có)
- 👷 Người phụ trách
- 📊 Trạng thái
- 📸 Hình ảnh đính kèm (nếu có)

#### Actions
- ➕ Tạo yêu cầu mới
- ✏️ Chỉnh sửa thông tin
- 👷 Assign cho technician
- 🔄 Cập nhật trạng thái
- 💬 Thêm ghi chú
- ✅ Đánh dấu hoàn thành
- 🗑️ Hủy yêu cầu

### 6. Báo Cáo & Thống Kê (Reports)
#### Báo Cáo Doanh Thu
- 💰 Doanh thu theo tháng/quý/năm
- 📊 Biểu đồ doanh thu
- 📈 So sánh với kỳ trước
- 💵 Tổng thu/chi

#### Báo Cáo Phòng
- 📊 Tỷ lệ lấp đầy theo thời gian
- 🏠 Số phòng trống/đã thuê
- 📈 Xu hướng thuê phòng

#### Báo Cáo Bảo Trì
- 🔧 Số lượng yêu cầu theo tháng
- ⏱️ Thời gian xử lý trung bình
- 💰 Chi phí bảo trì

### 7. Cài Đặt (Settings)
#### Thông Tin Tài Khoản Admin
- 👤 Cập nhật tên đầy đủ
- 📱 Cập nhật số điện thoại
- 📧 Email (read-only)

#### Đổi Mật Khẩu
- 🔑 Mật khẩu hiện tại
- 🔑 Mật khẩu mới (min 6 ký tự)
- 🔑 Xác nhận mật khẩu mới
- ✅ Validation và error handling

#### UI Features
- ✨ 2-column responsive layout
- ✨ Success/error messages
- ✨ Loading states
- ✨ Hover effects

---

## 🏠 CHỨC NĂNG TENANT (NGƯỜI THUÊ)

### 1. Dashboard (Bảng Điều Khiển)
#### Thông Tin Phòng Hiện Tại
- 🏠 Số phòng & tòa nhà
- 📐 Diện tích
- 💰 Giá thuê/tháng
- 📅 Ngày bắt đầu thuê
- 💵 Tiền cọc
- ✅ Trạng thái hợp đồng

#### Tình Trạng Thanh Toán
- ⚠️ Hóa đơn chưa thanh toán (số lượng + tổng tiền)
- 📋 Hóa đơn tháng này (số tiền + hạn thanh toán)
- ✓ Lịch sử thanh toán (số hóa đơn đã trả)
- 📊 Tất cả hóa đơn

#### Yêu Cầu Bảo Trì
- 🔧 Đang xử lý (số lượng)
- ✓ Hoàn thành (số lượng)
- 📅 Yêu cầu gần nhất
- ➕ Nút tạo yêu cầu mới nhanh
- 📋 3 yêu cầu gần nhất với chi tiết

#### Thông Báo
- 🔔 5 thông báo mới nhất
- 💰 Invoice notifications
- 🔧 Maintenance updates
- 📢 Announcements
- ✓ Payment confirmations

#### UI Features
- ✨ Compact responsive layout
- ✨ Hover effects trên tất cả cards
- ✨ Clickable cards với navigation
- ✨ Color-coded status
- ✨ Real-time data updates

### 2. Phòng Của Tôi (My Room)
#### Thông Tin Chi Tiết Phòng
- 🏠 Số phòng & tòa nhà
- 📐 Diện tích chi tiết
- 💰 Giá thuê & breakdown
- 🛏️ Loại phòng
- 🔑 Trạng thái

#### Thông Tin Hợp Đồng
- 📝 Số hợp đồng
- 📅 Ngày bắt đầu
- 📅 Ngày kết thúc
- 💵 Tiền cọc
- 📄 File hợp đồng (nếu có)

#### Tiện Ích & Dịch Vụ
- ⚡ Điện
- 💧 Nước
- 🌐 Internet
- 🧹 Dịch vụ vệ sinh

### 3. Hóa Đơn (Invoices)
#### Tabs Phân Loại
- ⚠️ Chưa thanh toán
- ✓ Đã thanh toán
- 🔴 Quá hạn
- 📊 Tất cả

#### Chức Năng
- 🔍 Search theo tháng, năm, số tiền
- 🗓️ Filter theo tháng
- 📋 Hiển thị grid với invoice cards

#### Thông Tin Hóa Đơn
- 🔢 Mã hóa đơn
- 📅 Tháng/Năm
- 💰 Các khoản phí (Phòng/Điện/Nước/Internet)
- 💵 Tổng tiền
- 📅 Hạn thanh toán
- 📊 Trạng thái

#### Actions
- 👁️ Xem chi tiết hóa đơn
- 💳 Thanh toán online (nếu chưa trả)
- 🖨️ In/Download hóa đơn
- 📧 Gửi email hóa đơn

### 4. Bảo Trì (Maintenance)
#### Danh Sách Yêu Cầu
- 🔍 Tabs: Đang xử lý / Hoàn thành / Đã hủy / Tất cả
- 📋 Grid view với maintenance cards
- 🔧 Thông tin: Tiêu đề, mô tả, danh mục, ưu tiên, trạng thái, ngày tạo

#### Tạo Yêu Cầu Mới
- 📝 Form popup/inline
- Thông tin cần nhập:
  - 📄 Tiêu đề
  - 📝 Mô tả chi tiết
  - 🏷️ Danh mục (Plumbing/Electrical/Structural/Appliance/Ventilation/Door-Lock/Paint/Other)
  - ⚠️ Mức độ ưu tiên (Urgent/High/Medium/Low)
  - 📸 Upload hình ảnh (optional)

#### Actions
- ➕ Tạo yêu cầu mới (nút nổi bật)
- 👁️ Xem chi tiết yêu cầu
- 💬 Thêm comment/update
- 🗑️ Hủy yêu cầu (nếu chưa xử lý)

#### UI Features
- ✨ Hover effects trên cards
- ✨ Color-coded priority badges
- ✨ Status indicators
- ✨ Responsive form

### 5. Tin Nhắn (Messages)
#### Giao Diện Chat
- 💬 2-panel layout (Conversations list + Chat area)
- 👥 Danh sách cuộc trò chuyện
- 🔔 Badge số tin nhắn chưa đọc
- ⏰ Timestamp

#### Chức Năng Chat
- 📝 Nhắn tin với Admin/Staff
- 📎 Đính kèm file (nếu có)
- ✓ Read receipts
- ⏰ Real-time messaging
- 🔍 Search conversations

#### Cuộc Trò Chuyện
- 👤 Avatar & tên người chat
- 📧 Email
- 💬 Nội dung tin nhắn
- 📅 Thời gian

### 6. Thanh Toán (Payments)
#### Lịch Sử Thanh Toán
- 💳 Danh sách các lần thanh toán
- 📅 Ngày thanh toán
- 💰 Số tiền
- 📝 Mô tả
- 📊 Trạng thái
- 🧾 Biên lai

#### Phương Thức Thanh Toán
- 💳 Thẻ tín dụng/ghi nợ
- 🏦 Chuyển khoản ngân hàng
- 💰 Tiền mặt
- 📱 Ví điện tử (Momo/ZaloPay/VNPay)

### 7. Hồ Sơ (Profile)
#### Thông Tin Cá Nhân
- 👤 Cập nhật tên đầy đủ
- 📱 Cập nhật số điện thoại
- 📧 Email (read-only)

#### Đổi Mật Khẩu
- 🔑 Mật khẩu hiện tại
- 🔑 Mật khẩu mới (min 6 ký tự)
- 🔑 Xác nhận mật khẩu mới
- ✅ Validation và error handling

#### UI Features
- ✨ 2-column responsive layout
- ✨ Success/error messages (auto-hide sau 3s)
- ✨ Loading states
- ✨ Hover effects
- ✨ Form validation

---

## 🎨 UI/UX DESIGN

### Neobrutalism Design System
- ✨ Bold black borders (2px, 4px)
- ✨ Flat colors, no gradients
- ✨ Box shadows (neo-shadow)
- ✨ High contrast
- ✨ Uppercase typography
- ✨ Chunky buttons

### Components
- 📦 NeoButton (Primary/Secondary/Destructive)
- 🔲 NeoCard (với shadow và border)
- 📝 NeoInput (với validation states)
- ☑️ NeoCheckbox
- 🎴 Cards (Invoice/Maintenance/Stats/Room)
- 🔔 Notification Items
- 📊 Stats Cards

### Responsive Design
- 📱 Mobile-first approach
- 💻 Tablet và Desktop optimized
- 🔄 Flexible grid layouts
- 📐 Breakpoints: sm/md/lg/xl

### Animations & Transitions
- ✨ Hover effects (shadow + translate)
- ✨ Slide-up animations
- ✨ Bounce-in animations
- ✨ Shake animations (errors)
- ✨ Smooth transitions (transition-all)

### Color Scheme
- 🎨 Primary: Yellow (#FFC700)
- 🎨 Card: White (#FFFFFF)
- 🎨 Background: Light gray (#F5F5F5)
- 🎨 Destructive: Red
- 🎨 Success: Green
- 🎨 Accent: Blue

---

## 🔧 BACKEND API ENDPOINTS

### Authentication
```
POST   /api/auth/login          - Đăng nhập
POST   /api/auth/register       - Đăng ký
POST   /api/auth/logout         - Đăng xuất
GET    /api/auth/me             - Lấy thông tin user hiện tại
```

### Users
```
GET    /api/users               - Lấy danh sách users (admin)
GET    /api/users/:id           - Lấy thông tin user theo ID
POST   /api/users               - Tạo user mới
PUT    /api/users/:id           - Cập nhật user
DELETE /api/users/:id           - Xóa user
GET    /api/users/profile/me    - Lấy profile của user hiện tại
PUT    /api/users/profile/me    - Cập nhật profile
POST   /api/users/profile/change-password - Đổi mật khẩu
```

### Units (Phòng)
```
GET    /api/units               - Lấy danh sách phòng
GET    /api/units/:id           - Lấy thông tin phòng theo ID
POST   /api/units               - Tạo phòng mới
PUT    /api/units/:id           - Cập nhật phòng
DELETE /api/units/:id           - Xóa phòng
GET    /api/units/available     - Lấy danh sách phòng trống
```

### Tenants (Người thuê)
```
GET    /api/tenants             - Lấy danh sách tenants
GET    /api/tenants/:id         - Lấy thông tin tenant theo ID
POST   /api/tenants             - Tạo tenant mới
PUT    /api/tenants/:id         - Cập nhật tenant
DELETE /api/tenants/:id         - Xóa tenant
GET    /api/tenants/profile/me  - Lấy profile tenant hiện tại
```

### Invoices (Hóa đơn)
```
GET    /api/invoices            - Lấy danh sách hóa đơn
GET    /api/invoices/:id        - Lấy hóa đơn theo ID
POST   /api/invoices            - Tạo hóa đơn mới
PUT    /api/invoices/:id        - Cập nhật hóa đơn
DELETE /api/invoices/:id        - Xóa hóa đơn
PUT    /api/invoices/:id/pay    - Thanh toán hóa đơn
```

### Maintenance Tickets (Bảo trì)
```
GET    /api/maintenance-tickets           - Lấy danh sách tickets
GET    /api/maintenance-tickets/:id       - Lấy ticket theo ID
POST   /api/maintenance-tickets           - Tạo ticket mới
PUT    /api/maintenance-tickets/:id       - Cập nhật ticket
DELETE /api/maintenance-tickets/:id       - Xóa ticket
PUT    /api/maintenance-tickets/:id/status - Cập nhật trạng thái
```

### Dashboard
```
GET    /api/dashboard/admin     - Lấy dữ liệu dashboard admin
GET    /api/dashboard/tenant    - Lấy dữ liệu dashboard tenant
```

### Notifications
```
GET    /api/notifications       - Lấy danh sách thông báo
PUT    /api/notifications/:id/read - Đánh dấu đã đọc
DELETE /api/notifications/:id   - Xóa thông báo
```

### Messages
```
GET    /api/messages            - Lấy danh sách tin nhắn
GET    /api/messages/:conversationId - Lấy tin nhắn theo conversation
POST   /api/messages            - Gửi tin nhắn mới
```

---

## 📊 DATABASE MODELS

### User
- fullName, email, password (hashed)
- role (admin/tenant)
- phone, address, dateOfBirth, avatar
- isActive, createdAt, updatedAt

### Unit (Phòng)
- unitNumber, building
- floor, squareMeters
- roomType (studio/1br/2br)
- rentPrice, depositAmount
- status (vacant/occupied/maintenance)
- amenities, description
- createdAt, updatedAt

### Tenant (Người thuê)
- userId (ref: User)
- currentUnit (ref: Unit)
- moveInDate, moveOutDate
- depositPaid, depositAmount
- status (active/inactive/pending)
- emergencyContact
- createdAt, updatedAt

### Invoice (Hóa đơn)
- tenant (ref: Tenant)
- unit (ref: Unit)
- month, year
- rentAmount
- utilities (electricity, water, internet)
- otherCharges, discount
- totalAmount, dueDate
- status (draft/issued/paid/overdue)
- paidDate, paymentMethod
- createdAt, updatedAt

### MaintenanceTicket (Bảo trì)
- tenant (ref: Tenant)
- unit (ref: Unit)
- title, description
- category (plumbing/electrical/structural/...)
- priority (urgent/high/medium/low)
- status (new/assigned/in-progress/completed/cancelled)
- assignedTo (ref: User)
- completedDate, notes
- images
- createdAt, updatedAt

### Notification (Thông báo)
- recipient (ref: User)
- type (invoice/maintenance/announcement/payment/contract)
- title, message
- isRead, readAt
- createdAt

### Message (Tin nhắn)
- sender (ref: User)
- recipient (ref: User)
- content, messageType
- conversationId
- isRead, readAt
- createdAt

### Contract (Hợp đồng)
- tenant (ref: Tenant)
- unit (ref: Unit)
- startDate, endDate
- rentAmount, depositAmount
- terms, signedDate
- status (draft/active/expired/terminated)
- documentUrl
- createdAt, updatedAt

### Payment (Thanh toán)
- invoice (ref: Invoice)
- tenant (ref: Tenant)
- amount, paymentDate
- paymentMethod (cash/transfer/card/ewallet)
- transactionId, notes
- status (pending/completed/failed)
- receiptUrl
- createdAt

### ActivityLog (Nhật ký hoạt động)
- user (ref: User)
- action (create/update/delete/login/logout)
- targetModel (Unit/Tenant/Invoice/...)
- targetId
- description, ipAddress
- createdAt

---

## 🔐 SECURITY FEATURES

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Password hashing với bcrypt (10 salt rounds)
- ✅ Token expiration (24 hours)
- ✅ Protected routes với middleware
- ✅ Role-based access control

### Data Security
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB ODM)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Environment variables cho sensitive data

### Password Requirements
- ✅ Minimum 6 characters
- ✅ Password confirmation
- ✅ Current password verification khi đổi mật khẩu
- ✅ Password field không bao giờ trả về trong API (select: false)

---

## 🚀 PERFORMANCE OPTIMIZATIONS

### Frontend
- ✅ Code splitting với Next.js
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Client-side caching (localStorage/sessionStorage)
- ✅ Debounced search
- ✅ Pagination

### Backend
- ✅ Database indexing
- ✅ Query optimization với select fields
- ✅ Pagination với limit/skip
- ✅ Async/await error handling
- ✅ Connection pooling

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- ✅ Hamburger menu
- ✅ Collapsible sidebar
- ✅ Touch-friendly buttons
- ✅ Swipeable cards
- ✅ Responsive tables → cards

---

## 🎯 KEY FEATURES SUMMARY

### ✅ Đã Hoàn Thành
1. ✅ Authentication (Login/Signup/Logout)
2. ✅ Admin Dashboard với statistics
3. ✅ Tenant Dashboard với overview
4. ✅ Rooms Management (CRUD)
5. ✅ Tenants Management (CRUD)
6. ✅ Invoices Management (CRUD + Payment)
7. ✅ Maintenance Tickets (CRUD + Status)
8. ✅ Profile Management (Admin & Tenant)
9. ✅ Change Password (Admin & Tenant)
10. ✅ Messages System
11. ✅ Notifications
12. ✅ Responsive Neobrutalism UI
13. ✅ Form Validation
14. ✅ Error Handling
15. ✅ Loading States
16. ✅ Hover Effects
17. ✅ Protected Routes
18. ✅ Role-based Access

### 🔄 Có Thể Mở Rộng
- 📊 Advanced Analytics & Charts
- 📧 Email notifications
- 📱 SMS notifications
- 💳 Online payment gateway integration
- 📄 PDF generation for invoices/contracts
- 📸 Image upload for maintenance tickets
- 🗓️ Calendar view for maintenance schedule
- 📈 Revenue forecasting
- 🔔 Real-time push notifications
- 💬 Real-time chat với WebSocket
- 📱 Mobile app (React Native)
- 🌍 Multi-language support
- 🎨 Theme customization
- 📤 Export reports (Excel/PDF)

---

## 🛠️ INSTALLATION & SETUP

### Prerequisites
```bash
Node.js >= 18.x
MongoDB >= 6.x
npm hoặc yarn
```

### Backend Setup
```bash
cd room-management-server
npm install
cp .env.example .env
# Cấu hình .env với MongoDB URI và JWT_SECRET
npm run seed-admin  # Tạo admin user mặc định
npm start
```

### Frontend Setup
```bash
cd FE
npm install
cp .env.example .env.local
# Cấu hình NEXT_PUBLIC_API_URL
npm run dev
```

### Default Admin Account
```
Email: admin@roommanagement.com
Password: admin123
```

---

## 📝 NOTES

- Hệ thống sử dụng **Neobrutalism design** với bold borders, flat colors, và high contrast
- Tất cả forms đều có **validation** và **error handling**
- UI **responsive** hoàn toàn trên mobile, tablet, desktop
- **Real-time updates** cho dashboard statistics
- **Hover effects** trên tất cả interactive elements
- **Loading states** cho tất cả async operations
- **Success/Error messages** tự động hiển thị và ẩn

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: October 23, 2025  
**Tác giả**: Room Management System Team
