const mongoose = require('mongoose');
const MaintenanceTicket = require('./src/models/maintenanceTicket');

mongoose.connect('mongodb://localhost:27017/room_management')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const total = await MaintenanceTicket.countDocuments();
    console.log('Total maintenance tickets:', total);
    
    const byStatus = await MaintenanceTicket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('Tickets by status:', byStatus);
    
    const allTickets = await MaintenanceTicket.find().select('ticketNumber status priority category');
    console.log('All tickets:', allTickets);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
