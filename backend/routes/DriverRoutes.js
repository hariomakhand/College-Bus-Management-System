const express = require('express');
const { 
  getDriverDashboard, 
  updateDriverProfile, 
  updateBusLocation, 
  endTrip, 
  getBusLocation 
} = require('../controllers/DriverController');
const AuthProtect = require('../middlewares/AuthProtect');

const router = express.Router();

// Dashboard
router.get('/dashboard', AuthProtect, getDriverDashboard);

// Profile management
router.put('/profile', AuthProtect, updateDriverProfile);

// Location tracking
router.post('/update-location', AuthProtect, updateBusLocation);
router.post('/end-trip', AuthProtect, endTrip);
router.get('/bus-location/:busNumber', getBusLocation);





module.exports = router;