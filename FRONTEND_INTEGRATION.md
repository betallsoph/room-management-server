# 🔗 Hướng Dẫn Tích Hợp Frontend (Vite + React/Vue)

## ✅ Backend Đã Sẵn Sàng

Backend này được thiết kế để tương thích hoàn hảo với **Vite Frontend** (React, Vue, hoặc bất kỳ framework nào).

---

## 🚀 Quick Start

### 1. Backend Setup (Bước này)

```bash
# Clone repository
git clone https://github.com/betallsoph/room-management-server.git
cd room-management-server

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Sửa file .env (nếu cần)
# FRONTEND_URL=http://localhost:5173  # Vite default port

# Khởi động MongoDB (nếu chưa chạy)
# mongod

# Chạy server
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

---

## 🎨 Frontend Setup (Vite)

### Tạo Vite Project

```bash
# React
npm create vite@latest room-management-client -- --template react

# Vue
npm create vite@latest room-management-client -- --template vue

cd room-management-client
npm install
```

### Cài đặt Axios

```bash
npm install axios
```

### Tạo API Service (`src/services/api.js`)

```javascript
import axios from 'axios';

// Base URL của backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Tự động thêm JWT token vào headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi tự động
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn - chuyển về login page
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📋 API Usage Examples

### 1. Authentication

```javascript
import api from './services/api';

// Đăng ký
export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response;
};

// Đăng nhập
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  
  // Lưu token vào localStorage
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return response;
};

// Lấy thông tin user hiện tại
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response;
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
```

### 2. Units (Quản lý căn hộ)

```javascript
// Lấy danh sách căn hộ
export const getUnits = async (filters = {}) => {
  const response = await api.get('/units', { params: filters });
  return response;
};

// Lấy căn hộ trống
export const getAvailableUnits = async () => {
  const response = await api.get('/units/available/listing');
  return response;
};

// Chi tiết căn hộ
export const getUnitById = async (unitId) => {
  const response = await api.get(`/units/${unitId}`);
  return response;
};

// Tạo căn hộ mới (Admin only)
export const createUnit = async (unitData) => {
  const response = await api.post('/units', unitData);
  return response;
};

// Cập nhật căn hộ (Admin only)
export const updateUnit = async (unitId, unitData) => {
  const response = await api.put(`/units/${unitId}`, unitData);
  return response;
};
```

### 3. Tenants (Quản lý khách thuê)

```javascript
// Tenant xem profile của mình
export const getMyProfile = async () => {
  const response = await api.get('/tenants/my-profile');
  return response;
};

// Admin: Lấy danh sách tenants
export const getTenants = async () => {
  const response = await api.get('/tenants');
  return response;
};

// Admin: Tạo tenant mới
export const createTenant = async (tenantData) => {
  const response = await api.post('/tenants', tenantData);
  return response;
};
```

### 4. Invoices (Hóa đơn)

```javascript
// Tenant: Xem hóa đơn của mình
export const getMyInvoices = async () => {
  const response = await api.get('/invoices/my/list');
  return response;
};

// Tenant: Chi tiết hóa đơn
export const getInvoiceById = async (invoiceId) => {
  const response = await api.get(`/invoices/my/${invoiceId}`);
  return response;
};

// Admin: Tạo hóa đơn
export const createInvoice = async (invoiceData) => {
  const response = await api.post('/invoices', invoiceData);
  return response;
};

// Admin: Xác nhận thanh toán
export const confirmPayment = async (invoiceId) => {
  const response = await api.put(`/invoices/${invoiceId}/confirm-payment`);
  return response;
};
```

### 5. Notifications (Thông báo)

```javascript
// Lấy thông báo của tôi
export const getMyNotifications = async () => {
  const response = await api.get('/notifications/my/list');
  return response;
};

// Số thông báo chưa đọc
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread/count');
  return response;
};

// Đánh dấu đã đọc
export const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response;
};

// Đánh dấu tất cả đã đọc
export const markAllAsRead = async () => {
  const response = await api.put('/notifications/my/read-all');
  return response;
};
```

### 6. Messages (Chat)

```javascript
// Danh sách cuộc trò chuyện
export const getConversations = async () => {
  const response = await api.get('/messages/my/conversations');
  return response;
};

// Lịch sử chat
export const getConversationHistory = async (conversationId) => {
  const response = await api.get(`/messages/conversation/${conversationId}`);
  return response;
};

// Gửi tin nhắn
export const sendMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response;
};

// Số tin nhắn chưa đọc
export const getUnreadMessageCount = async () => {
  const response = await api.get('/messages/unread/count');
  return response;
};
```

---

## 🔧 Environment Variables Frontend

Tạo file `.env` trong project Vite:

```bash
# .env
VITE_API_URL=http://localhost:3000/api
```

**Production:**
```bash
# .env.production
VITE_API_URL=https://your-domain.com/api
```

---

## 📦 Component Examples

### Login Component (React)

```jsx
import { useState } from 'react';
import { login } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      console.log('Login success:', response);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
```

### Units List Component (React)

```jsx
import { useState, useEffect } from 'react';
import { getAvailableUnits } from '../services/api';

function UnitsList() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await getAvailableUnits();
        setUnits(data.units || []);
      } catch (error) {
        console.error('Failed to fetch units:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="units-grid">
      {units.map((unit) => (
        <div key={unit._id} className="unit-card">
          <h3>{unit.unitNumber}</h3>
          <p>Loại: {unit.type}</p>
          <p>Diện tích: {unit.area}m²</p>
          <p>Giá: {unit.rentPrice.toLocaleString()} VNĐ/tháng</p>
          <button>Xem chi tiết</button>
        </div>
      ))}
    </div>
  );
}

export default UnitsList;
```

---

## 🔐 Protected Routes

### React Router Example

```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export default ProtectedRoute;
```

**Usage:**
```jsx
<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 🌐 CORS Configuration

Backend đã được cấu hình CORS tự động:

- ✅ **Development:** `http://localhost:5173` (Vite default)
- ✅ **Custom Port:** Đặt `FRONTEND_URL` trong `.env`
- ✅ **Production:** Update `FRONTEND_URL` với domain thật

---

## 📊 API Response Format

Tất cả API trả về format chuẩn:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": { ... }
}
```

---

## 🔄 Real-time Updates (Optional)

Để thêm real-time notifications/messages, bạn có thể:

1. **Polling:** Gọi API mỗi 10-30 giây
2. **Socket.IO:** Thêm WebSocket support (cần extend backend)

---

## 📚 Complete API Documentation

Xem đầy đủ 97 endpoints tại:
```
http://localhost:3000/api-docs
```

---

## ✅ Checklist Tích Hợp

- [x] Backend có CORS
- [x] Backend có JWT authentication
- [x] API RESTful chuẩn
- [x] Response format nhất quán
- [x] Error handling đầy đủ
- [x] Swagger documentation
- [ ] Frontend axios service
- [ ] Frontend auth context
- [ ] Frontend protected routes
- [ ] Frontend API calls
- [ ] Frontend error handling

---

## 🎯 Next Steps

1. **Tạo Vite project**
2. **Copy API service code** từ file này
3. **Implement authentication flow**
4. **Build UI components**
5. **Connect to backend APIs**
6. **Test và deploy**

---

## 💡 Tips

- Luôn check token expiry (JWT hết hạn sau 24h)
- Implement refresh token nếu cần session dài
- Cache API responses khi có thể
- Sử dụng React Query hoặc SWR cho state management
- Implement loading states và error boundaries

---

## 📞 Support

Backend này **100% sẵn sàng** cho frontend Vite!

Nếu gặp vấn đề CORS hoặc authentication, kiểm tra:
1. Backend đang chạy ở port 3000
2. Frontend đang chạy ở port 5173
3. `FRONTEND_URL` trong `.env` đúng
4. Token được lưu trong localStorage

**Happy Coding! 🚀**
