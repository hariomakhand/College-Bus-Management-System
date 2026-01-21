const mongoose = require('mongoose');
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const Driver = require('./models/Driver');
const Student = require('./models/Student');
require('dotenv').config();

async function testNotificationScenarios() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create a test student if none exists
    let student = await Student.findOne({ email: 'test@student.com' });
    if (!student) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      student = new Student({
        name: 'Test Student',
        email: 'test@student.com',
        password: hashedPassword,
        studentId: 'STU001',
        phone: '1234567890',
        address: 'Test Address',
        role: 'student',
        isVerified: true,
        isApproved: true,
        busRegistrationStatus: 'approved'
      });
      await student.save();
      console.log('Created test student');
    }

    // Find existing bus and route
    const bus = await Bus.findOne({ busNumber: 'BUS001' });
    const route = await Route.findOne({ routeNumber: 'RT001' });
    
    if (bus && route) {
      // Assign student to bus
      student.busId = bus._id;
      student.appliedRouteId = route._id;
      await student.save();
      console.log('Assigned student to bus and route');
      
      console.log('\nTest scenarios ready:');
      console.log('1. Student assigned to Bus:', bus.busNumber);
      console.log('2. Student assigned to Route:', route.routeName);
      console.log('3. Student ID:', student._id);
      console.log('\nYou can now test the following in admin panel:');
      console.log('- Delete the bus to trigger "Bus Service Discontinued" notification');
      console.log('- Delete the route to trigger "Route Discontinued" notification');
      console.log('- Change bus status to trigger "Bus Status Update" notification');
      console.log('- Unassign/reassign driver to trigger driver change notifications');
    } else {
      console.log('Bus or Route not found. Please run seed scripts first.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testNotificationScenarios();