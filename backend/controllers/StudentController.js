const Student = require('../models/Student');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const Announcement = require('../models/Announcement');

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
          .populate('routeId', 'routeName routeNumber startPoint endPoint')
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

    // Check if pickup stop exists in route stops
    const routeStops = route.stops ? route.stops.split(',').map(stop => stop.trim().toLowerCase()) : [];
    const pickupStopLower = pickupStop.toLowerCase().trim();
    
    if (!routeStops.includes(pickupStopLower)) {
      // If stop doesn't exist, add it to the route
      const updatedStops = route.stops ? `${route.stops}, ${pickupStop}` : pickupStop;
      await Route.findByIdAndUpdate(routeId, { stops: updatedStops });
      
      console.log(`Added new bus stop '${pickupStop}' to route ${route.routeName}`);
    }

    // Update student with application details
    student.busRegistrationStatus = 'pending';
    student.appliedRouteId = routeId;
    student.preferredPickupStop = pickupStop;
    student.applicationReason = reason;
    student.applicationDate = new Date();
    
    await student.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Bus application submitted successfully. Your pickup stop has been added to the route if it was new.'
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

module.exports = {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  uploadProfileImage,
  applyForBus,
  getAvailableRoutes,
  sendSupportMessage,
  getBusPass,
  getStudentAnnouncements
};