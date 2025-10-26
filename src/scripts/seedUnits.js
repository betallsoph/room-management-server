const mongoose = require('mongoose');
const Unit = require('../models/unit');
const User = require('../models/user');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/room_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedUnits = async () => {
  try {
    // Tìm admin user để làm landlord
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('❌ Không tìm thấy admin user. Vui lòng tạo admin user trước.');
      process.exit(1);
    }

    console.log(`✅ Tìm thấy admin: ${adminUser.fullName} (${adminUser.email})`);

    // Xóa tất cả units cũ (optional - comment dòng này nếu muốn giữ data cũ)
    // await Unit.deleteMany({});
    // console.log('🗑️  Đã xóa tất cả units cũ');

    // Danh sách phòng mẫu
    const sampleUnits = [
      // Tòa A - Tầng 1
      {
        unitNumber: '101',
        building: 'A',
        floor: 1,
        squareMeters: 25,
        roomType: 'studio',
        rentPrice: 3000000,
        depositAmount: 6000000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
        description: 'Phòng studio tầng 1, view đường, thoáng mát',
        status: 'available',
        landlord: adminUser._id
      },
      {
        unitNumber: '102',
        building: 'A',
        floor: 1,
        squareMeters: 30,
        roomType: 'one-bedroom',
        rentPrice: 3500000,
        depositAmount: 7000000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Ban công'],
        description: 'Phòng 1 phòng ngủ, có ban công',
        status: 'available',
        landlord: adminUser._id
      },
      {
        unitNumber: '103',
        building: 'A',
        floor: 1,
        squareMeters: 28,
        roomType: 'studio',
        rentPrice: 3200000,
        depositAmount: 6400000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
        description: 'Phòng studio góc, 2 cửa sổ',
        status: 'occupied',
        landlord: adminUser._id
      },

      // Tòa A - Tầng 2
      {
        unitNumber: '201',
        building: 'A',
        floor: 2,
        squareMeters: 25,
        roomType: 'studio',
        rentPrice: 3100000,
        depositAmount: 6200000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
        description: 'Phòng studio tầng 2, yên tĩnh',
        status: 'available',
        landlord: adminUser._id
      },
      {
        unitNumber: '202',
        building: 'A',
        floor: 2,
        squareMeters: 35,
        roomType: 'one-bedroom',
        rentPrice: 4000000,
        depositAmount: 8000000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Ban công', 'Bếp riêng'],
        description: 'Phòng 1PN rộng rãi, có bếp riêng',
        status: 'available',
        landlord: adminUser._id
      },
      {
        unitNumber: '203',
        building: 'A',
        floor: 2,
        squareMeters: 30,
        roomType: 'studio',
        rentPrice: 3300000,
        depositAmount: 6600000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
        description: 'Phòng studio view đẹp',
        status: 'occupied',
        landlord: adminUser._id
      },

      // Tòa A - Tầng 3
      {
        unitNumber: '301',
        building: 'A',
        floor: 3,
        squareMeters: 40,
        roomType: 'two-bedroom',
        rentPrice: 5000000,
        depositAmount: 10000000,
        amenities: ['Điều hòa 2 cái', 'Nóng lạnh', 'WiFi', 'Ban công', 'Bếp riêng', 'WC riêng'],
        description: 'Căn 2 phòng ngủ cao cấp',
        status: 'available',
        landlord: adminUser._id
      },
      {
        unitNumber: '302',
        building: 'A',
        floor: 3,
        squareMeters: 28,
        roomType: 'one-bedroom',
        rentPrice: 3800000,
        depositAmount: 7600000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Ban công'],
        description: 'Phòng 1PN tầng cao, view thoáng',
        status: 'available',
        landlord: adminUser._id
      },

      // Tòa B - Tầng 1
      {
        unitNumber: '101',
        building: 'B',
        floor: 1,
        squareMeters: 22,
        roomType: 'studio',
        rentPrice: 2800000,
        depositAmount: 5600000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
        description: 'Phòng studio giá tốt, gần cửa ra vào',
        status: 'available',
        landlord: adminUser._id
      },
      {
        unitNumber: '102',
        building: 'B',
        floor: 1,
        squareMeters: 25,
        roomType: 'studio',
        rentPrice: 2900000,
        depositAmount: 5800000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
        description: 'Phòng studio mới sửa',
        status: 'maintenance',
        landlord: adminUser._id
      },

      // Tòa B - Tầng 2
      {
        unitNumber: '201',
        building: 'B',
        floor: 2,
        squareMeters: 30,
        roomType: 'one-bedroom',
        rentPrice: 3600000,
        depositAmount: 7200000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Ban công'],
        description: 'Phòng 1PN tòa B, yên tĩnh',
        status: 'occupied',
        landlord: adminUser._id
      },
      {
        unitNumber: '202',
        building: 'B',
        floor: 2,
        squareMeters: 32,
        roomType: 'one-bedroom',
        rentPrice: 3700000,
        depositAmount: 7400000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Ban công', 'Bếp riêng'],
        description: 'Phòng 1PN có bếp, ban công rộng',
        status: 'available',
        landlord: adminUser._id
      },

      // Tòa B - Tầng 3
      {
        unitNumber: '301',
        building: 'B',
        floor: 3,
        squareMeters: 45,
        roomType: 'two-bedroom',
        rentPrice: 5500000,
        depositAmount: 11000000,
        amenities: ['Điều hòa 2 cái', 'Nóng lạnh', 'WiFi', 'Ban công lớn', 'Bếp riêng', '2 WC'],
        description: 'Căn 2PN penthouse, view đẹp nhất',
        status: 'available',
        landlord: adminUser._id
      },
      {
        unitNumber: '302',
        building: 'B',
        floor: 3,
        squareMeters: 35,
        roomType: 'one-bedroom',
        rentPrice: 4200000,
        depositAmount: 8400000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Ban công', 'Bếp riêng'],
        description: 'Phòng 1PN tầng cao, đầy đủ tiện nghi',
        status: 'available',
        landlord: adminUser._id
      },

      // Tòa C - Tầng 1
      {
        unitNumber: '101',
        building: 'C',
        floor: 1,
        squareMeters: 20,
        roomType: 'studio',
        rentPrice: 2500000,
        depositAmount: 5000000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
        description: 'Phòng studio nhỏ gọn, giá rẻ',
        status: 'available',
        landlord: adminUser._id
      },
      {
        unitNumber: '102',
        building: 'C',
        floor: 1,
        squareMeters: 28,
        roomType: 'studio',
        rentPrice: 3000000,
        depositAmount: 6000000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Ban công nhỏ'],
        description: 'Phòng studio có ban công',
        status: 'occupied',
        landlord: adminUser._id
      },

      // Tòa C - Tầng 2
      {
        unitNumber: '201',
        building: 'C',
        floor: 2,
        squareMeters: 30,
        roomType: 'one-bedroom',
        rentPrice: 3500000,
        depositAmount: 7000000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Ban công'],
        description: 'Phòng 1PN tiêu chuẩn',
        status: 'available',
        landlord: adminUser._id
      },
      {
        unitNumber: '202',
        building: 'C',
        floor: 2,
        squareMeters: 30,
        roomType: 'one-bedroom',
        rentPrice: 3500000,
        depositAmount: 7000000,
        amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
        description: 'Phòng 1PN view sân',
        status: 'available',
        landlord: adminUser._id
      }
    ];

    // Clear existing units first
    const deleteResult = await Unit.deleteMany({});
    console.log(`🗑️  Đã xóa ${deleteResult.deletedCount} phòng cũ\n`);

    // Insert units
    let created = 0;
    let skipped = 0;

    for (const unitData of sampleUnits) {
      try {
        const unit = new Unit(unitData);
        await unit.save();
        console.log(`✅ Đã tạo phòng ${unit.building}${unit.unitNumber} - ${unit.roomType} - ${unit.status}`);
        created++;
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⚠️  Phòng ${unitData.building}${unitData.unitNumber} đã tồn tại - bỏ qua`);
          skipped++;
        } else {
          throw err;
        }
      }
    }

    console.log('\n==============================================');
    console.log(`🎉 HOÀN THÀNH!`);
    console.log(`✅ Đã tạo: ${created} phòng`);
    console.log(`⚠️  Đã bỏ qua: ${skipped} phòng (đã tồn tại)`);
    console.log(`📊 Tổng: ${sampleUnits.length} phòng`);
    console.log('==============================================\n');

    // Thống kê
    const totalUnits = await Unit.countDocuments();
    const availableUnits = await Unit.countDocuments({ status: 'available' });
    const occupiedUnits = await Unit.countDocuments({ status: 'occupied' });
    const maintenanceUnits = await Unit.countDocuments({ status: 'maintenance' });

    console.log('📈 THỐNG KÊ DATABASE:');
    console.log(`   Tổng số phòng: ${totalUnits}`);
    console.log(`   Phòng trống: ${availableUnits}`);
    console.log(`   Phòng có người: ${occupiedUnits}`);
    console.log(`   Phòng bảo trì: ${maintenanceUnits}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seed units:', error);
    process.exit(1);
  }
};

// Run seed
seedUnits();
