const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user');
require('dotenv').config();

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Xóa users cũ (nếu có)
    await User.deleteMany({ email: { $in: ['admin@example.com', 'staff@example.com', 'tenant@example.com'] } });

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Tạo Admin
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      phoneNumber: '0901234567',
      status: 'active'
    });
    console.log('✅ Admin created:', admin.email);

    // Tạo Staff
    const staff = await User.create({
      fullName: 'Staff User',
      email: 'staff@example.com',
      password: hashedPassword,
      role: 'staff',
      phoneNumber: '0901234568',
      status: 'active'
    });
    console.log('✅ Staff created:', staff.email);

    // Tạo Tenant
    const tenant = await User.create({
      fullName: 'Tenant User',
      email: 'tenant@example.com',
      password: hashedPassword,
      role: 'tenant',
      phoneNumber: '0901234569',
      status: 'active'
    });
    console.log('✅ Tenant created:', tenant.email);

    console.log('\n🎉 All test users created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:  admin@example.com  / password123');
    console.log('Staff:  staff@example.com  / password123');
    console.log('Tenant: tenant@example.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUsers();
