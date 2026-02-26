const Student = require('../models/Student');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const Announcement = require('../models/Announcement');

// Calculate time for new stop
const calculateStopTime = (route, newStopCoords) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  let stops = [];
  try {
    stops = JSON.parse(route.stops || '[]');
  } catch (e) {
    stops = [];
  }
  
  // Filter stops with valid coordinates and time
  const validStops = stops.filter(s => s.coordinates && s.time && s.time !== 'TBD');
  
  if (validStops.length === 0) {
    // No valid stops, use route departure time
    if (route.departureTime && route.estimatedTime) {
      const [depHour, depMin] = route.departureTime.split(':').map(Number);
      const depMinutes = depHour * 60 + depMin;
      const avgTimePerStop = route.estimatedTime / (stops.length + 1);
      const newStopMinutes = Math.round(depMinutes + avgTimePerStop);
      
      const hour = Math.floor(newStopMinutes / 60) % 24;
      const min = newStopMinutes % 60;
      return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
    return null;
  }
  
  // Find closest stops before and after
  let closestBefore = null, closestAfter = null;
  let minDistBefore = Infinity, minDistAfter = Infinity;
  
  validStops.forEach(stop => {
    const dist = getDistance(
      stop.coordinates.lat, stop.coordinates.lng,
      newStopCoords.lat, newStopCoords.lng
    );
    
    if (dist < minDistBefore) {
      minDistBefore = dist;
      closestBefore = stop;
    }
  });
  
  // Find another stop for reference
  validStops.forEach(stop => {
    if (stop !== closestBefore) {
      const dist = getDistance(
        stop.coordinates.lat, stop.coordinates.lng,
        newStopCoords.lat, newStopCoords.lng
      );
      if (dist < minDistAfter) {
        minDistAfter = dist;
        closestAfter = stop;
      }
    }
  });
  
  if (closestBefore && closestAfter) {
    // Calculate based on two reference stops
    const distToBefore = getDistance(
      closestBefore.coordinates.lat, closestBefore.coordinates.lng,
      newStopCoords.lat, newStopCoords.lng
    );
    const distToAfter = getDistance(
      newStopCoords.lat, newStopCoords.lng,
      closestAfter.coordinates.lat, closestAfter.coordinates.lng
    );
    const totalDist = distToBefore + distToAfter;
    
    const [beforeHour, beforeMin] = closestBefore.time.split(':').map(Number);
    const [afterHour, afterMin] = closestAfter.time.split(':').map(Number);
    const beforeMinutes = beforeHour * 60 + beforeMin;
    const afterMinutes = afterHour * 60 + afterMin;
    const timeDiff = Math.abs(afterMinutes - beforeMinutes);
    
    const avgSpeed = totalDist / (timeDiff / 60) || 30; // Default 30 km/h
    const timeToNewStop = (distToBefore / avgSpeed) * 60;
    const newStopMinutes = Math.round(beforeMinutes + timeToNewStop);
    
    const hour = Math.floor(newStopMinutes / 60) % 24;
    const min = newStopMinutes % 60;
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  } else if (closestBefore) {
    // Only one reference stop - calculate based on distance
    const distToNewStop = getDistance(
      closestBefore.coordinates.lat, closestBefore.coordinates.lng,
      newStopCoords.lat, newStopCoords.lng
    );
    
    // Use average city bus speed of 25 km/h
    const avgSpeed = 25;
    const timeToNewStop = (distToNewStop / avgSpeed) * 60; // minutes
    
    const [hour, min] = closestBefore.time.split(':').map(Number);
    const minutes = hour * 60 + min + Math.round(timeToNewStop);
    const newHour = Math.floor(minutes / 60) % 24;
    const newMin = minutes % 60;
    
    console.log(`Distance-based calculation: ${distToNewStop.toFixed(2)} km at ${avgSpeed} km/h = ${timeToNewStop.toFixed(1)} min`);
    return `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
  }
  
  return null;
};

// Get Student Dashboard Data
const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get assigned route and bus info if student is approved
    let assignedRoute = null;
    let assignedBus = null;
    let assignedDriver = null;
    
    if (student.busRegistrationStatus === 'approved') {
      // Get the actual assigned bus from student.busId
      if (student.busId) {
        assignedBus = await Bus.findOne({
          _id: student.busId,
          isDeleted: false
        })
          .populate('routeId') // Populate all route fields
          .populate('driverId', 'name phoneNumber profileImage');
        
        if (assignedBus) {
          assignedRoute = assignedBus.routeId;
          assignedDriver = assignedBus.driverId;
        } else {
          // If assigned bus is deleted, reset student's bus assignment
          student.busId = null;
          student.busRegistrationStatus = 'pending';
          await student.save({ validateBeforeSave: false });
        }
      }
      
      // Fallback: if no busId but has appliedRouteId, get route info
      if (!assignedRoute && student.appliedRouteId) {
        assignedRoute = await Route.findById(student.appliedRouteId);
      }
      
      // Auto-recalculate TBD times if route has coordinates
      if (assignedRoute && assignedRoute.stops) {
        try {
          let stops = JSON.parse(assignedRoute.stops);
          let needsUpdate = false;
          
          for (let i = 0; i < stops.length; i++) {
            if (stops[i].time === 'TBD' && stops[i].coordinates) {
              const calculatedTime = calculateStopTime(assignedRoute, stops[i].coordinates);
              if (calculatedTime) {
                stops[i].time = calculatedTime;
                needsUpdate = true;
                console.log(`Auto-calculated time for ${stops[i].name}: ${calculatedTime}`);
              }
            }
          }
          
          if (needsUpdate) {
            await Route.findByIdAndUpdate(assignedRoute._id, { 
              stops: JSON.stringify(stops) 
            });
            assignedRoute.stops = JSON.stringify(stops);
          }
        } catch (e) {
          console.error('Error auto-calculating stop times:', e);
        }
      }
    }

    // Get active announcements
    const announcements = await Announcement.find({
      isActive: true,
      $and: [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'students' }
          ]
        },
        {
          $or: [
            { expiryDate: { $gte: new Date() } },
            { expiryDate: null }
          ]
        }
      ]
    })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    const alerts = announcements.map(announcement => ({
      id: announcement._id,
      type: announcement.type,
      message: announcement.message,
      title: announcement.title,
      time: announcement.createdAt,
      priority: announcement.priority
    }));

    // Mock schedule - replace with actual schedule system
    const schedule = [
      { day: 'Monday', pickup: '8:00 AM', dropoff: '5:00 PM' },
      { day: 'Tuesday', pickup: '8:00 AM', dropoff: '5:00 PM' },
      { day: 'Wednesday', pickup: '8:00 AM', dropoff: '5:00 PM' },
      { day: 'Thursday', pickup: '8:00 AM', dropoff: '5:00 PM' },
      { day: 'Friday', pickup: '8:00 AM', dropoff: '5:00 PM' }
    ];

    res.json({
      success: true,
      data: {
        student: {
          ...student.toObject(),
          assignedRoute: assignedRoute ? {
            routeName: assignedRoute.routeName,
            routeNumber: assignedRoute.routeNumber,
            startPoint: assignedRoute.startPoint,
            endPoint: assignedRoute.endPoint,
            stops: assignedRoute.stops || '',
            distance: assignedRoute.distance,
            estimatedTime: assignedRoute.estimatedTime,
            pickupTime: '8:00 AM',
            dropTime: '5:00 PM'
          } : null,
          assignedBus: assignedBus ? {
            busNumber: assignedBus.busNumber,
            model: assignedBus.model,
            capacity: assignedBus.capacity
          } : null,
          assignedDriver: assignedDriver ? {
            name: assignedDriver.name,
            phone: assignedDriver.phoneNumber,
            profileImage: assignedDriver.profileImage
          } : null
        },
        alerts: alerts,
        schedule,
        registrationStatus: student.busRegistrationStatus || 'not_registered'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Student Profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Student Profile
const updateStudentProfile = async (req, res) => {
  try {
    const { name, phone, address, emergencyContact, department, year } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, emergencyContact, department, year },
      { new: true, validateBeforeSave: false }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload Profile Image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const cloudinary = require('../config/cloudinary');
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'student-profiles',
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      {
        profileImage: {
          url: result.secure_url,
          publicId: result.public_id
        }
      },
      { new: true, validateBeforeSave: false }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: student.profileImage
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply for Bus Service
const applyForBus = async (req, res) => {
  try {
    const { routeId, pickupStop, reason } = req.body;

    const studentId = req.user.id;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found. Please make sure you are logged in.'
      });
    }

    // Check if student is approved for registration
    if (!student.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Your registration is not approved yet. Please wait for admin approval.'
      });
    }

    console.log('Student application check:', {
      studentId: student._id,
      busRegistrationStatus: student.busRegistrationStatus,
      appliedRouteId: student.appliedRouteId,
      routeId: routeId,
      isApproved: student.isApproved
    });

    if ((student.busRegistrationStatus === 'pending' || student.busRegistrationStatus === 'approved') && student.appliedRouteId) {
      // Check if the applied route still exists
      const existingRoute = await Route.findById(student.appliedRouteId);
      if (existingRoute && !existingRoute.isDeleted) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active bus application'
        });
      } else {
        // Route was deleted, clear the application
        student.busRegistrationStatus = 'not_registered';
        student.appliedRouteId = null;
        student.busId = null;
        student.preferredPickupStop = null;
        student.applicationReason = null;
        await student.save({ validateBeforeSave: false });
      }
    }

    // Get the route to validate pickup stop
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Handle pickupStop - can be string or object
    let stopName = typeof pickupStop === 'object' ? pickupStop.name : pickupStop;
    let stopCoordinates = typeof pickupStop === 'object' ? pickupStop.coordinates : null;
    let estimatedTime = null;

    console.log('=== APPLY FOR BUS DEBUG ===');
    console.log('Pickup stop:', pickupStop);
    console.log('Stop name:', stopName);
    console.log('Stop coordinates:', stopCoordinates);
    console.log('Route stops:', route.stops);

    // Check if pickup stop exists in route stops
    let routeStops = [];
    try {
      routeStops = JSON.parse(route.stops || '[]');
      console.log('Parsed route stops:', routeStops);
    } catch (e) {
      routeStops = route.stops ? route.stops.split(',').map(s => ({ name: s.trim() })) : [];
      console.log('Fallback parsed stops:', routeStops);
    }
    
    const existingStop = routeStops.find(s => s.name && s.name.toLowerCase() === stopName.toLowerCase());
    console.log('Existing stop found:', existingStop);
    
    if (!existingStop && stopCoordinates) {
      console.log('Adding new stop with coordinates...');
      // Calculate estimated time for new stop
      estimatedTime = calculateStopTime(route, stopCoordinates);
      console.log('Calculated time:', estimatedTime);
      
      // Add new stop to route
      const newStop = {
        name: stopName,
        coordinates: stopCoordinates,
        time: estimatedTime || 'TBD'
      };
      routeStops.push(newStop);
      await Route.findByIdAndUpdate(routeId, { stops: JSON.stringify(routeStops) });
      
      console.log(`Added new bus stop '${stopName}' at ${estimatedTime || 'TBD'} to route ${route.routeName}`);
    } else if (existingStop) {
      estimatedTime = existingStop.time;
      console.log('Using existing stop time:', estimatedTime);
    } else {
      console.log('No coordinates provided for new stop');
    }

    // Update student with application details
    student.busRegistrationStatus = 'pending';
    student.appliedRouteId = routeId;
    student.preferredPickupStop = stopName;
    student.applicationReason = reason;
    student.applicationDate = new Date();
    
    await student.save({ validateBeforeSave: false });

    const message = estimatedTime 
      ? `Bus application submitted! Bus will arrive at ${stopName} at approximately ${estimatedTime}.`
      : 'Bus application submitted successfully.';

    res.json({
      success: true,
      message,
      estimatedTime
    });
  } catch (error) {
    console.error('Apply for bus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Available Routes
const getAvailableRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ 
      status: 'active',
      isDeleted: false 
    }).select('routeName routeNumber startPoint endPoint distance estimatedTime stops');

    // Get buses and drivers for each route
    const routesWithDetails = await Promise.all(routes.map(async (route) => {
      const buses = await Bus.find({ 
        routeId: route._id,
        isDeleted: false 
      })
      .populate('driverId', 'name phoneNumber email profileImage')
      .select('busNumber model capacity driverId');

      return {
        ...route.toObject(),
        buses: buses.map(bus => ({
          busNumber: bus.busNumber,
          model: bus.model,
          capacity: bus.capacity,
          driver: bus.driverId ? {
            name: bus.driverId.name,
            phone: bus.driverId.phoneNumber,
            email: bus.driverId.email,
            profileImage: bus.driverId.profileImage
          } : null
        }))
      };
    }));

    res.json({
      success: true,
      routes: routesWithDetails
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Support Message
const sendSupportMessage = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const student = await Student.findById(req.user.id);

    // In a real application, you would save this to a support tickets collection
    // For now, we'll just return success
    console.log(`Support message from ${student.name} (${student.email}):`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    res.json({
      success: true,
      message: 'Support message sent successfully. We will get back to you soon.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Bus Pass Details
const getBusPass = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate({
        path: 'busId',
        select: 'busNumber model',
        match: { isDeleted: false }
      })
      .select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if assigned bus still exists
    if (student.busRegistrationStatus === 'approved' && !student.busId) {
      // Reset student's bus assignment if bus was deleted
      student.busRegistrationStatus = 'pending';
      await student.save({ validateBeforeSave: false });
      
      return res.status(400).json({
        success: false,
        message: 'Your assigned bus is no longer available. Please apply again.'
      });
    }

    if (student.busRegistrationStatus !== 'approved' || !student.busId) {
      return res.status(400).json({
        success: false,
        message: 'Bus pass not available. Please ensure your application is approved.'
      });
    }

    const busPass = {
      studentName: student.name,
      studentId: student.studentId,
      busNumber: student.busId.busNumber,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      issueDate: new Date().toISOString()
    };

    res.json({
      success: true,
      busPass
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get announcements for students
const getStudentAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isActive: true,
      $and: [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'students' }
          ]
        },
        {
          $or: [
            { expiryDate: { $gte: new Date() } },
            { expiryDate: null }
          ]
        }
      ]
    })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request Route/Stop Change
const requestRouteChange = async (req, res) => {
  try {
    const { newRouteId, newPickupStop, reason } = req.body;
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.busRegistrationStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'You must have an approved bus assignment first' });
    }

    // Validate new route
    const newRoute = await Route.findById(newRouteId);
    if (!newRoute || newRoute.isDeleted) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    // Update student with change request
    student.changeRequest = {
      type: newRouteId !== student.appliedRouteId ? 'route' : 'stop',
      newRouteId,
      newPickupStop,
      reason,
      status: 'pending',
      requestDate: new Date()
    };

    await student.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Change request submitted successfully. Admin will review it soon.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Recalculate times for stops with TBD
const recalculateStopTimes = async (req, res) => {
  try {
    const { routeId } = req.params;
    
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    let stops = [];
    try {
      stops = JSON.parse(route.stops || '[]');
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid stops format' });
    }

    let updated = false;
    for (let i = 0; i < stops.length; i++) {
      if (stops[i].time === 'TBD' && stops[i].coordinates) {
        const calculatedTime = calculateStopTime(route, stops[i].coordinates);
        if (calculatedTime) {
          stops[i].time = calculatedTime;
          updated = true;
          console.log(`Updated time for ${stops[i].name}: ${calculatedTime}`);
        }
      }
    }

    if (updated) {
      await Route.findByIdAndUpdate(routeId, { stops: JSON.stringify(stops) });
      return res.json({ 
        success: true, 
        message: 'Stop times recalculated successfully',
        stops 
      });
    }

    res.json({ success: true, message: 'No stops needed recalculation', stops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  uploadProfileImage,
  applyForBus,
  getAvailableRoutes,
  sendSupportMessage,
  getBusPass,
  getStudentAnnouncements,
  requestRouteChange,
  recalculateStopTimes
};