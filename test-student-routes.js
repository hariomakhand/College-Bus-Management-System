// Simple test to check if student routes are working
const express = require('express');
const app = express();

app.use(express.json());

// Test route
app.get('/api/student/test', (req, res) => {
  res.json({ success: true, message: 'Student routes are working!' });
});

// Import and use student routes
try {
  const studentRoutes = require('./backend/routes/StudentRoutes');
  app.use('/api/student', studentRoutes);
  console.log('✅ Student routes imported successfully');
} catch (error) {
  console.error('❌ Error importing student routes:', error.message);
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Test the routes:');
  console.log(`- GET http://localhost:${PORT}/api/student/test`);
});