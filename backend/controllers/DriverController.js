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
    
    // GPS Accuracy Filter - accept network location for real-world usage
    if (accuracy > 50000) { // 50km tolerance for network location
      console.log(`Rejected extremely poor GPS reading for bus ${busNumber}: ±${Math.round(accuracy)}m accuracy`);
      return res.status(400).json({
        success: false,
        message: `GPS accuracy too poor: ±${Math.round(accuracy)}m. Need ≤50km for tracking.`,
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
      console.log(`BACKEND: Emitting busLocationUpdate to room bus-${busNumber}`);
      console.log(`BACKEND: Location data:`, { lat, lng, accuracy: locationData.accuracy });
      
      global.io.to(`bus-${busNumber}`).emit('busLocationUpdate', {
        busNumber,
        location: { lat, lng },
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        timestamp: locationData.timestamp,
        tripStatus
      });
      
      console.log(`BACKEND: ✓ Emitted to bus-${busNumber}`);
    } else {
      console.log('BACKEND: ⚠️ Socket.io not available');
    }

    // Update database
    console.log(`Updating database for bus ${busNumber} with location:`, { lat, lng });
    const updateResult = await Bus.findOneAndUpdate(
      { busNumber },
      { 
        currentLocation: { lat, lng },
        lastLocationUpdate: new Date(),
        tripStatus: tripStatus || 'active',
        lastAccuracy: locationData.accuracy
      },
      { new: true }
    );
    
    if (updateResult) {
      console.log(`✓ Database updated for bus ${busNumber}:`, updateResult.currentLocation);
    } else {
      console.log(`⚠️ Bus ${busNumber} not found in database`);
    }

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
    
    console.log(`🛑 Ending trip for bus ${busNumber}, driver ${driverId}`);
    
    // Remove from active locations immediately
    const wasActive = activeBusLocations.has(busNumber);
    activeBusLocations.delete(busNumber);
    
    console.log(`📋 Active location ${wasActive ? 'removed' : 'was not active'} for bus ${busNumber}`);
    
    // Emit trip end to students
    if (global.io) {
      console.log(`📡 Emitting tripEnded to room bus-${busNumber}`);
      global.io.to(`bus-${busNumber}`).emit('tripEnded', {
        busNumber,
        message: 'Trip has ended',
        timestamp: new Date()
      });
    }
    
    // Update bus status in database
    const updateResult = await Bus.findOneAndUpdate(
      { busNumber },
      { 
        tripStatus: 'ended',
        lastLocationUpdate: new Date(),
        currentLocation: null // Clear current location
      },
      { new: true }
    );
    
    if (updateResult) {
      console.log(`✅ Database updated - trip ended for bus ${busNumber}`);
    } else {
      console.log(`⚠️ Bus ${busNumber} not found in database`);
    }

    res.json({
      success: true,
      message: 'Trip ended successfully',
      busNumber,
      wasTracking: wasActive
    });
  } catch (error) {
    console.error('❌ End trip error:', error);
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

    // Get assigned bus and route with detailed information
    const assignedBus = await Bus.findOne({
      driverId: driver._id,
      isDeleted: false
    }).populate('routeId');

    // Get students assigned to this driver's bus
    const assignedStudents = assignedBus ? await Student.find({
      busId: assignedBus._id,
      busRegistrationStatus: 'approved'
    }).select('name studentId preferredPickupStop phone profileImage') : [];

    // Format route data with stops details
    let assignedRoute = null;
    if (assignedBus && assignedBus.routeId) {
      const route = assignedBus.routeId;
      assignedRoute = {
        _id: route._id,
        routeName: route.routeName,
        routeNumber: route.routeNumber,
        startPoint: route.startPoint,
        endPoint: route.endPoint,
        distance: route.distance,
        estimatedTime: route.estimatedTime,
        startTime: route.startTime || '07:00 AM',
        endTime: route.endTime || '06:00 PM',
        description: route.description,
        stops: route.stopsDetails && route.stopsDetails.length > 0 
          ? route.stopsDetails 
          : route.stops 
            ? route.stops.split(',').map((stop, index) => ({
                stopName: stop.trim(),
                timing: `${7 + Math.floor(index * 0.5)}:${(index * 30) % 60 < 10 ? '0' : ''}${(index * 30) % 60} AM`
              }))
            : []
      };
    }

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
            status: assignedBus.status,
            currentLocation: assignedBus.currentLocation,
            lastLocationUpdate: assignedBus.lastLocationUpdate
          } : null
        },
        assignedRoute,
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

// Send Notification to Route Students
const sendNotificationToStudents = async (req, res) => {
  try {
    const { message, type = 'info' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification message is required'
      });
    }

    // Get driver's assigned bus and route
    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const assignedBus = await Bus.findOne({
      driverId: driver._id,
      isDeleted: false
    }).populate('routeId');

    if (!assignedBus) {
      return res.status(400).json({
        success: false,
        message: 'No bus assigned to you'
      });
    }

    // Get students registered for this bus/route
    const students = await Student.find({
      busId: assignedBus._id,
      busRegistrationStatus: 'approved'
    });

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No students found on your route'
      });
    }

    // Send notification to each student via socket
    if (global.io) {
      const notificationData = {
        type,
        message,
        from: `Driver ${driver.name}`,
        busNumber: assignedBus.busNumber,
        routeName: assignedBus.routeId?.routeName || 'Your Route',
        timestamp: new Date()
      };

      students.forEach(student => {
        global.io.to(`student-${student._id}`).emit('driverNotification', notificationData);
      });
    }

    res.json({
      success: true,
      message: `Notification sent to ${students.length} students`,
      studentsNotified: students.length
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
  sendNotificationToStudents,
  activeBusLocations
};