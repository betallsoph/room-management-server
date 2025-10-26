const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const userRoutes = require('./routes/userRoute');
const authRoutes = require('./routes/authRoute');
const adminRoutes = require('./routes/adminRoute');

// Dashboard route
const dashboardRoutes = require('./routes/dashboardRoute');

// New apartment/rental management routes
const unitRoutes = require('./routes/unitRoute');
const tenantRoutes = require('./routes/tenantRoute');
const contractRoutes = require('./routes/contractRoute');
const invoiceRoutes = require('./routes/invoiceRoute');
const paymentRoutes = require('./routes/paymentRoute');
const utilityReadingRoutes = require('./routes/utilityReadingRoute');
const maintenanceTicketRoutes = require('./routes/maintenanceTicketRoute');
const documentRoutes = require('./routes/documentRoute');
const notificationRoutes = require('./routes/notificationRoute');
const messageRoutes = require('./routes/messageRoute');

const app = express();

// CORS Configuration - Allow multiple frontend ports
const corsOptions = {
  origin: [
    'http://localhost:3001', // Next.js default
    'http://localhost:5173', // Vite default
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded documents)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Apartment Management API Docs'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Core routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Apartment rental management routes
app.use('/api/units', unitRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/utility-readings', utilityReadingRoutes);
app.use('/api/maintenance-tickets', maintenanceTicketRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
