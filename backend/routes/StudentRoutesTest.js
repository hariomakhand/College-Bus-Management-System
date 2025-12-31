const express = require('express');
const router = express.Router();

// Simple test routes without authentication
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Student routes are working!' });
});

router.get('/dashboard', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      student: { name: 'Test Student', email: 'test@example.com' },
      registrationStatus: 'not_registered',
      alerts: [],
      schedule: []
    }
  });
});

router.get('/routes', (req, res) => {
  res.json({ 
    success: true, 
    routes: [
      { _id: '1', routeName: 'Test Route', routeNumber: 'TR001', distance: 10, estimatedTime: 30 }
    ]
  });
});

router.post('/apply-bus', (req, res) => {
  res.json({ success: true, message: 'Application submitted successfully' });
});

router.get('/bus-pass', (req, res) => {
  res.json({ 
    success: true, 
    busPass: {
      studentName: 'Test Student',
      studentId: 'STU001',
      busNumber: 'B001',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

module.exports = router;