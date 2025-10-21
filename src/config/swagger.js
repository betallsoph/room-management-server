const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Apartment Rental Management API',
      version: '1.0.0',
      description: `
# Hệ thống Quản lý Chung cư/Trọ

API cho hệ thống quản lý phòng thuê chung cư, hỗ trợ cả chủ nhà (Admin/Landlord) và khách thuê (Tenant).

## Tính năng chính:

### Khách thuê (Tenant):
- Gửi số điện nước cuối tháng
- Xem hợp đồng, hóa đơn, lịch sử thanh toán
- Báo cáo sự cố (maintenance tickets)
- Upload giấy tờ (CCCD, ảnh check-in)
- Nhận thông báo
- Chat với chủ nhà

### Chủ nhà (Admin/Landlord):
- Tự động tính tiền và gửi hóa đơn hàng tháng
- Xác nhận thanh toán, đánh dấu tình trạng
- Quản lý phòng, toà nhà, khách thuê
- Lưu bill và ảnh đồng hồ (3 tháng)
- Gửi thông báo theo block/toà/phòng
- Chat với khách thuê
- Quản lý sự cố bảo trì

## Authentication:
Tất cả các endpoints (trừ /api/auth/signup và /api/auth/login) yêu cầu Bearer Token trong header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@apartmentmanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.apartmentmanagement.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            fullName: { type: 'string', example: 'Nguyễn Văn A' },
            email: { type: 'string', example: 'nguyenvana@example.com' },
            role: { 
              type: 'string', 
              enum: ['admin', 'staff', 'tenant'],
              example: 'tenant'
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Unit: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            unitNumber: { type: 'string', example: 'A101' },
            building: { type: 'string', example: 'A' },
            floor: { type: 'integer', example: 1 },
            squareMeters: { type: 'number', example: 45.5 },
            roomType: { 
              type: 'string',
              enum: ['studio', 'one-bedroom', 'two-bedroom', 'three-bedroom'],
              example: 'one-bedroom'
            },
            rentPrice: { type: 'number', example: 5000000 },
            depositAmount: { type: 'number', example: 10000000 },
            status: {
              type: 'string',
              enum: ['available', 'occupied', 'maintenance'],
              example: 'available'
            },
            amenities: {
              type: 'array',
              items: { type: 'string' },
              example: ['air-conditioner', 'water-heater', 'balcony']
            }
          }
        },
        Tenant: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            identityCard: { type: 'string', example: '079012345678' },
            phone: { type: 'string', example: '0901234567' },
            currentUnit: { type: 'string' },
            moveInDate: { type: 'string', format: 'date' },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'moved-out'],
              example: 'active'
            }
          }
        },
        Contract: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            contractNumber: { type: 'string', example: 'HĐ-2025-01-A101' },
            unit: { type: 'string' },
            tenant: { type: 'string' },
            landlord: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            rentAmount: { type: 'number', example: 5000000 },
            depositAmount: { type: 'number', example: 10000000 },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'expired', 'terminated'],
              example: 'active'
            }
          }
        },
        Invoice: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoiceNumber: { type: 'string', example: 'INV-2025-01-A101' },
            contract: { type: 'string' },
            month: { type: 'integer', example: 1 },
            year: { type: 'integer', example: 2025 },
            rentAmount: { type: 'number', example: 5000000 },
            totalAmount: { type: 'number', example: 6200000 },
            status: {
              type: 'string',
              enum: ['draft', 'issued', 'paid', 'overdue'],
              example: 'issued'
            },
            dueDate: { type: 'string', format: 'date' }
          }
        },
        MaintenanceTicket: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            ticketNumber: { type: 'string', example: 'TK-2025-00001' },
            unit: { type: 'string' },
            category: {
              type: 'string',
              enum: ['plumbing', 'electrical', 'structural', 'appliance', 'other']
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high'
            },
            title: { type: 'string', example: 'Rò rỉ nước' },
            description: { type: 'string' },
            status: {
              type: 'string',
              enum: ['new', 'assigned', 'in-progress', 'completed', 'rejected']
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            recipient: { type: 'string' },
            notificationType: {
              type: 'string',
              enum: ['invoice-issued', 'payment-due', 'payment-received', 'maintenance-assigned', 'message']
            },
            title: { type: 'string' },
            message: { type: 'string' },
            isRead: { type: 'boolean', example: false },
            sentAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Đăng ký, đăng nhập, quản lý phiên làm việc'
      },
      {
        name: 'Units',
        description: 'Quản lý phòng/căn hộ (Admin)'
      },
      {
        name: 'Tenants',
        description: 'Quản lý khách thuê'
      },
      {
        name: 'Contracts',
        description: 'Quản lý hợp đồng thuê'
      },
      {
        name: 'Invoices',
        description: 'Quản lý hóa đơn thanh toán'
      },
      {
        name: 'Payments',
        description: 'Quản lý thanh toán'
      },
      {
        name: 'Utility Readings',
        description: 'Quản lý chỉ số điện nước'
      },
      {
        name: 'Maintenance',
        description: 'Quản lý báo cáo sự cố'
      },
      {
        name: 'Documents',
        description: 'Quản lý tài liệu, giấy tờ'
      },
      {
        name: 'Notifications',
        description: 'Quản lý thông báo'
      },
      {
        name: 'Messages',
        description: 'Quản lý tin nhắn/chat'
      },
      {
        name: 'Admin',
        description: 'Quản trị hệ thống'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
