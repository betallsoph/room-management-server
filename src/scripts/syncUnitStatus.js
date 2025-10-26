const mongoose = require('mongoose');
const Unit = require('../models/unit');
const Tenant = require('../models/tenant');

async function syncUnitStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/room_management');
    console.log('✅ Connected to MongoDB');

    // Get all active tenants with units
    const activeTenants = await Tenant.find({ 
      status: 'active',
      currentUnit: { $ne: null }
    }).select('_id currentUnit');

    console.log(`📊 Found ${activeTenants.length} active tenants with units`);

    // Reset all units to available and clear currentTenant
    const resetResult = await Unit.updateMany({}, { 
      status: 'available',
      currentTenant: null
    });
    console.log(`🔄 Reset ${resetResult.modifiedCount} units to available`);

    // Update each occupied unit with status and currentTenant
    if (activeTenants.length > 0) {
      let updatedCount = 0;
      for (const tenant of activeTenants) {
        try {
          await Unit.findByIdAndUpdate(tenant.currentUnit, {
            status: 'occupied',
            currentTenant: tenant._id
          });
          updatedCount++;
        } catch (err) {
          console.error(`Error updating unit ${tenant.currentUnit}:`, err.message);
        }
      }
      console.log(`✅ Updated ${updatedCount} units to occupied with tenant links`);
    }

    // Show summary
    const stats = await Unit.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📈 Unit Status Summary:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    console.log('\n✅ Sync completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

// Run sync
syncUnitStatus();
