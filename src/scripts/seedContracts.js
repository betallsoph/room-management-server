require('dotenv').config();
const mongoose = require('mongoose');
const Contract = require('../models/contract');
const Unit = require('../models/unit');
const Tenant = require('../models/tenant');
const User = require('../models/user');

const seedContracts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/room_management');
    console.log('✅ Connected to MongoDB');

    // Get admin user (landlord)
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found. Please create an admin first.');
      process.exit(1);
    }
    console.log('✅ Found admin:', admin.email);

    // Get available units
    const units = await Unit.find({ status: 'available' }).limit(5);
    if (units.length === 0) {
      console.error('❌ No available units found. Please seed units first.');
      process.exit(1);
    }
    console.log(`✅ Found ${units.length} available units`);

    // Get tenants
    const tenants = await Tenant.find().populate('userId').limit(5);
    if (tenants.length === 0) {
      console.error('❌ No tenants found. Creating sample tenants...');
      
      // Create sample tenant users
      const User = require('../models/user');
      const bcrypt = require('bcryptjs');
      
      const sampleTenants = [];
      for (let i = 1; i <= 5; i++) {
        // Create user account
        const hashedPassword = await bcrypt.hash('123456', 10);
        const user = await User.create({
          fullName: `Nguyễn Văn ${String.fromCharCode(64 + i)}`,
          email: `tenant${i}@example.com`,
          password: hashedPassword,
          phoneNumber: `090${1000000 + i}`,
          role: 'tenant',
          isActive: true
        });

        // Create tenant profile
        const tenant = await Tenant.create({
          userId: user._id,
          identityCard: `0${10000000 + i}`,
          dateOfBirth: new Date(1990 + i, i - 1, i),
          permanentAddress: `${i * 10} Đường ABC, Quận ${i}, TP.HCM`,
          emergencyContact: {
            name: `Người thân ${i}`,
            relationship: 'Cha/Mẹ',
            phoneNumber: `091${2000000 + i}`
          }
        });

        sampleTenants.push(tenant);
        console.log(`✅ Created tenant: ${user.fullName} (${user.email})`);
      }
      
      tenants.push(...sampleTenants);
    }
    console.log(`✅ Found ${tenants.length} tenants`);

    // Delete existing contracts
    await Contract.deleteMany({});
    console.log('🗑️  Cleared existing contracts');

    // Create sample contracts
    const contracts = [];
    const startDate = new Date();
    startDate.setDate(1); // Start of current month

    for (let i = 0; i < Math.min(units.length, tenants.length); i++) {
      const unit = units[i];
      const tenant = tenants[i];
      
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year contract

      const contractNumber = `HĐ-2025-${String(i + 1).padStart(2, '0')}-${unit.building}${unit.unitNumber}`;

      const termsText = [
        'Thanh toán tiền thuê trước ngày 5 hàng tháng',
        'Không được chuyển nhượng hợp đồng cho người khác',
        'Giữ gìn vệ sinh chung',
        'Báo trước 1 tháng nếu muốn chấm dứt hợp đồng'
      ].join('\n');

      const contract = await Contract.create({
        contractNumber,
        unit: unit._id,
        tenant: tenant._id,
        landlord: admin._id,
        startDate,
        endDate,
        rentAmount: unit.rentPrice,
        depositAmount: unit.rentPrice * 2, // 2 months deposit
        utilities: {
          electricity: true,
          water: true,
          internet: true
        },
        status: 'active',
        terms: termsText
      });

      // Update unit status
      unit.status = 'occupied';
      unit.currentTenant = tenant._id;
      await unit.save();

      // Update tenant current unit
      tenant.currentUnit = unit._id;
      tenant.moveInDate = startDate;
      await tenant.save();

      contracts.push(contract);
      console.log(`✅ Created contract ${contractNumber} - ${unit.building}${unit.unitNumber} - ${tenant.userId?.fullName || 'Unknown'}`);
    }

    console.log('\n🎉 Sample contracts created successfully!');
    console.log(`📊 Total: ${contracts.length} contracts`);
    console.log('\nContract details:');
    contracts.forEach((c, i) => {
      console.log(`${i + 1}. ${c.contractNumber} - Status: ${c.status} - Rent: ${c.rentAmount.toLocaleString('vi-VN')} VND`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the seed
seedContracts();
