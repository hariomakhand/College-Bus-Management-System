require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const clearInvalidChangeRequests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Clear changeRequest for students who don't have actual change requests
    const result = await Student.updateMany(
      {
        $or: [
          { 'changeRequest.type': { $exists: false } },
          { 'changeRequest.reason': { $exists: false } }
        ]
      },
      { $unset: { changeRequest: "" } }
    );

    console.log(`Cleared ${result.modifiedCount} invalid change requests`);
    
    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearInvalidChangeRequests();
