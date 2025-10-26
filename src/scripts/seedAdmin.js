const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/room-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAdminUser = async () => {
  try {
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@roommanagement.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user đã tồn tại:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Tên: ${existingAdmin.fullName}`);
      console.log(`   Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      fullName: 'Admin',
      email: 'admin@roommanagement.com',
      password: hashedPassword,
      phone: '0900000000',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    console.log('🎉 TẠO ADMIN USER THÀNH CÔNG!');
    console.log('================================');
    console.log(`📧 Email: admin@roommanagement.com`);
    console.log(`🔑 Password: admin123`);
    console.log(`👤 Tên: Admin`);
    console.log(`🎭 Role: admin`);
    console.log('================================');
    console.log('⚠️  QUAN TRỌNG: Hãy đổi mật khẩu sau khi đăng nhập lần đầu!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo admin user:', error);
    process.exit(1);
  }
};

// Run seed
seedAdminUser();
