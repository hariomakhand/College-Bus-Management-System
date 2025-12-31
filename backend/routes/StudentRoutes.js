const express = require('express');
const { 
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  applyForBus,
  getAvailableRoutes,
  sendSupportMessage,
  getBusPass,
  getStudentAnnouncements
} = require('../controllers/StudentController');
const AuthProtect = require('../middlewares/AuthProtect');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Student routes are working!' });
});

// Test routes endpoint
router.get('/test-routes', async (req, res) => {
  try {
    const Route = require('../models/Route');
    const routes = await Route.find({ 
      status: 'active',
      isDeleted: false 
    }).select('routeName routeNumber startPoint endPoint distance estimatedTime');
    
    res.json({
      success: true,
      message: 'Routes test successful',
      count: routes.length,
      routes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Routes test failed', 
      error: error.message 
    });
  }
});

// Create sample route for testing
router.post('/create-sample-route', async (req, res) => {
  try {
    const Route = require('../models/Route');
    
    const sampleRoute = new Route({
      routeName: 'Main Campus Route',
      routeNumber: 'RT001',
      startPoint: 'City Center',
      endPoint: 'University Campus',
      distance: 15,
      estimatedTime: 45,
      stops: 'Main Gate, Library, Cafeteria',
      status: 'active'
    });
    
    await sampleRoute.save();
    
    res.json({
      success: true,
      message: 'Sample route created successfully',
      route: sampleRoute
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create sample route', 
      error: error.message 
    });
  }
});

// Dashboard
router.get('/dashboard', AuthProtect, getStudentDashboard);

// Profile management
router.get('/profile', AuthProtect, getStudentProfile);
router.put('/profile', AuthProtect, updateStudentProfile);

// Bus application
router.post('/apply-bus', AuthProtect, applyForBus);

// Test apply-bus route without auth
router.post('/test-apply-bus', (req, res) => {
  res.json({ success: true, message: 'Apply-bus route exists and working!' });
});

// Create test student
router.post('/create-test-student', async (req, res) => {
  try {
    const Student = require('../models/Student');
    
    const testStudent = new Student({
      name: 'Test Student',
      email: 'test@student.com',
      studentId: 'TEST001',
      password: 'password123',
      role: 'student'
    });
    
    await testStudent.save();
    
    res.json({
      success: true,
      message: 'Test student created',
      studentId: testStudent._id
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create test student', 
      error: error.message 
    });
  }
});
router.get('/routes', getAvailableRoutes);

// Bus pass
router.get('/bus-pass', AuthProtect, getBusPass);

// Support
router.post('/support', AuthProtect, sendSupportMessage);

// Announcements
router.get('/announcements', AuthProtect, getStudentAnnouncements);

module.exports = router;