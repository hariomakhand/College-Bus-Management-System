const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Driver = require('./models/Driver');

const createTestDriver = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ email: 'driver@test.com' });
    if (existingDriver) {
      console.log('Test driver already exists');
      return;
    }

    // Create test driver
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testDriver = new Driver({
      name: 'Test Driver',
      email: 'driver@test.com',
      password: hashedPassword,
      role: 'driver',
      isVerified: true,
      licenseNumber: 'DL123456789',
      phoneNumber: '+1234567890',
      address: '123 Driver Street',
      emergencyContact: '+0987654321',
      experience: 5,
      status: 'active'
    });

    await testDriver.save();
    console.log('Test driver created successfully!');
    console.log('Email: driver@test.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating test driver:', error);
  } finally {
    mongoose.disconnect();
  }
};

createTestDriver();