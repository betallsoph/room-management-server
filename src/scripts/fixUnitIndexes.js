const mongoose = require('mongoose');
const Unit = require('../models/unit');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/room-management');

const fixIndexes = async () => {
  try {
    console.log('🔧 Đang sửa indexes...');
    
    // Drop old index
    try {
      await Unit.collection.dropIndex('unitNumber_1');
      console.log('✅ Đã xóa index cũ unitNumber_1');
    } catch (err) {
      console.log('⚠️  Index unitNumber_1 không tồn tại (OK)');
    }
    
    // Create new compound unique index
    await Unit.collection.createIndex(
      { building: 1, unitNumber: 1 }, 
      { unique: true }
    );
    console.log('✅ Đã tạo compound index { building: 1, unitNumber: 1 }');
    
    // List all indexes
    const indexes = await Unit.collection.indexes();
    console.log('\n📋 Danh sách indexes hiện tại:');
    indexes.forEach(idx => {
      console.log(`   - ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''}`);
    });
    
    console.log('\n🎉 Hoàn thành! Bạn có thể chạy seedUnits.js ngay bây giờ.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

fixIndexes();
