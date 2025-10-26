require('dotenv').config();
const mongoose = require('mongoose');
const Contract = require('../models/contract');
const Unit = require('../models/unit');
const Tenant = require('../models/tenant');
const User = require('../models/user');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/room_management');
    console.log('✅ Connected to MongoDB');

    // Get all admins
    const admins = await User.find({ role: 'admin' });
    console.log('\n📋 Admin users:');
    admins.forEach((admin, i) => {
      console.log(`${i + 1}. ${admin.email} - ID: ${admin._id}`);
    });

    // Get all contracts
    const contracts = await Contract.find()
      .populate('unit', 'unitNumber building')
      .populate('tenant', 'name')
      .populate('landlord', 'email fullName');
    
    console.log('\n📋 All Contracts:');
    if (contracts.length === 0) {
      console.log('❌ No contracts found!');
    } else {
      contracts.forEach((contract, i) => {
        console.log(`${i + 1}. ${contract.contractNumber}`);
        console.log(`   Status: ${contract.status}`);
        console.log(`   Unit: ${contract.unit?.building}${contract.unit?.unitNumber}`);
        console.log(`   Landlord ID: ${contract.landlord?._id || contract.landlord}`);
        console.log(`   Landlord Email: ${contract.landlord?.email || 'N/A'}`);
        console.log('');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();
