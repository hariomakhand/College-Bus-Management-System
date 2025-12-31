const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Student = require('../models/Student');

// Store for active bus locations (in production, use Redis)
const activeBusLocations = new Map();

// Update Bus Location
const updateBusLocation = async (req, res) => {
  try {
    const { driverId, busNumber, location, tripStatus } = req.body;
    
    // Validate location data
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location data'
      });
    }

    // Validate coordinates and accuracy
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);
    const accuracy = parseFloat(location.accuracy) || 999;
    const speed = parseFloat(location.speed) || 0;
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates'
      });
    }
    
    // GPS Accuracy Filter - more lenient for real-world usage
    if (accuracy > 500) {
      console.log(`Rejected extremely poor GPS reading for bus ${busNumber}: ±${Math.round(accuracy)}m accuracy`);
      return res.status(400).json({
        success: false,
        message: `GPS accuracy too poor: ±${Math.round(accuracy)}m. Need ≤500m for tracking.`,
        accuracy: Math.round(accuracy)
      });
    }

    // Store validated location
    const locationData = {
      lat,
      lng,
      accuracy: Math.round(accuracy),
      speed: Math.round(speed * 3.6),
      timestamp: new Date(),
      driverId,
      busNumber,
      tripStatus
    };

    activeBusLocations.set(busNumber, locationData);
    console.log(`✓ GPS Update for bus ${busNumber}: ±${locationData.accuracy}m, ${locationData.speed}km/h`);

    // Emit to students
    if (global.io) {
      global.io.to(`bus-${busNumber}`).emit('busLocationUpdate', {
        busNumber,
        location: { lat, lng },
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        timestamp: locationData.timestamp,
        tripStatus
      });
    }

    // Update database
    await Bus.findOneAndUpdate(
      { busNumber },
      { 
        currentLocation: { lat, lng },
        lastLocationUpdate: new Date(),
        tripStatus: tripStatus || 'active',
        lastAccuracy: locationData.accuracy
      }
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: locationData
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// End Trip
const endTrip = async (req, res) => {
  try {
    const { driverId, busNumber } = req.body;
    
    // Remove from active locations
    activeBusLocations.delete(busNumber);
    
    // Emit trip end to students
    if (global.io) {
      global.io.to(`bus-${busNumber}`).emit('tripEnded', {
        busNumber,
        message: 'Trip has ended'
      });
    }
    
    // Update bus status
    await Bus.findOneAndUpdate(
      { busNumber },
      { 
        tripStatus: 'ended',
        lastLocationUpdate: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Trip ended successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Bus Location (for students)
// Get Bus Location (for students)
const getBusLocation = async (req, res) => {
  try {
    const { busNumber } = req.params;
    console.log('Getting location for bus:', busNumber);

    // 1️⃣ Try from memory (fast)
    let locationData = activeBusLocations.get(busNumber);

    // 2️⃣ If not found in memory → fallback to DB
    if (!locationData) {
      console.log('Location not found in memory, checking DB...');

      const bus = await Bus.findOne({ busNumber });

      if (!bus || !bus.currentLocation) {
        return res.status(404).json({
          success: false,
          status: 'inactive',
          message: 'Bus tracking not started yet'
        });
      }

      locationData = {
        lat: bus.currentLocation.lat,
        lng: bus.currentLocation.lng,
        timestamp: bus.lastLocationUpdate,
        tripStatus: bus.tripStatus || 'inactive'
      };
    }

    // 3️⃣ Check location freshness (10 min)
    const MAX_AGE_MINUTES = 10;
    const now = new Date();
    const locationAge =
      (now - new Date(locationData.timestamp)) / 1000 / 60;

    if (locationAge > MAX_AGE_MINUTES) {
      return res.status(200).json({
        success: false,
        status: 'inactive',
        message: 'Bus location is outdated',
        lastKnownLocation: {
          lat: locationData.lat,
          lng: locationData.lng,
          timestamp: locationData.timestamp
        }
      });
    }

    // 4️⃣ Success response
    return res.json({
      success: true,
      status: 'active',
      location: {
        lat: locationData.lat,
        lng: locationData.lng,
        timestamp: locationData.timestamp,
        tripStatus: locationData.tripStatus,
        accuracy: locationData.accuracy || null
      }
    });

  } catch (error) {
    console.error('Error getting bus location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus location'
    });
  }
};


// Get Driver Dashboard Data
const getDriverDashboard = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id).select('-password');
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Get assigned bus and route
    const assignedBus = await Bus.findOne({
      driverId: driver._id,
      isDeleted: false
    }).populate('routeId', 'routeName routeNumber startPoint endPoint stops');

    // Get students assigned to this driver's bus
    const assignedStudents = assignedBus ? await Student.find({
      busId: assignedBus._id,
      busRegistrationStatus: 'approved'
    }).select('name studentId preferredPickupStop phone') : [];

    res.json({
      success: true,
      data: {
        driver: {
          ...driver.toObject(),
          assignedBus: assignedBus ? {
            _id: assignedBus._id,
            busNumber: assignedBus.busNumber,
            model: assignedBus.model,
            capacity: assignedBus.capacity,
            route: assignedBus.routeId
          } : null
        },
        assignedStudents,
        stats: {
          totalStudents: assignedStudents.length,
          busCapacity: assignedBus?.capacity || 0,
          availableSeats: assignedBus ? assignedBus.capacity - assignedStudents.length : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Driver Profile
const updateDriverProfile = async (req, res) => {
  try {
    const { name, phoneNumber, address, emergencyContact, experience } = req.body;
    
    const driver = await Driver.findByIdAndUpdate(
      req.user.id,
      { name, phoneNumber, address, emergencyContact, experience },
      { new: true, validateBeforeSave: false }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      driver
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDriverDashboard,
  updateDriverProfile,
  updateBusLocation,
  endTrip,
  getBusLocation,
  activeBusLocations
};