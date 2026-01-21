
const Driver = require("../models/Driver");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Student = require("../models/Student");
const Announcement = require("../models/Announcement");
const bcrypt = require("bcryptjs");
const { createNotification } = require('./NotificationController');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalDrivers, totalBuses, totalRoutes, totalStudents] = await Promise.all([
      Driver.countDocuments({ isDeleted: false }),
      Bus.countDocuments({ isDeleted: false }),
      Route.countDocuments({ isDeleted: false }),
      Student.countDocuments({ isDeleted: false })
    ]);

    const [activeBuses, maintenanceBuses, inactiveBuses] = await Promise.all([
      Bus.countDocuments({ status: 'active', isDeleted: false }),
      Bus.countDocuments({ status: 'maintenance', isDeleted: false }),
      Bus.countDocuments({ status: 'inactive', isDeleted: false })
    ]);

    const stats = {
      totalDrivers,
      totalBuses,
      totalRoutes,
      totalStudents,
      activeBuses,
      maintenanceBuses,
      inactiveBuses
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get all drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isDeleted: false })
      .select("-password")
      .sort({ createdAt: -1 });

    // Add assigned bus info for each driver
    const driversWithBusInfo = await Promise.all(
      drivers.map(async (driver) => {
        const assignedBus = await Bus.findOne({ 
          driverId: driver._id, 
          isDeleted: false 
        }).populate('routeId', 'routeName routeNumber startPoint endPoint');
        
        return {
          ...driver.toObject(),
          assignedBus: assignedBus ? {
            _id: assignedBus._id,
            busNumber: assignedBus.busNumber,
            model: assignedBus.model,
            capacity: assignedBus.capacity,
            route: assignedBus.routeId
          } : null
        };
      })
    );

    res.json({
      success: true,
      drivers: driversWithBusInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all buses
const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ isDeleted: false })
      .populate("driverId", "name email licenseNumber phoneNumber")
      .populate("routeId", "routeName routeNumber startPoint endPoint")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      buses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all routes
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ isDeleted: false })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      routes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all students with registration requests
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: false })
      .populate({
        path: 'busId',
        select: 'busNumber model capacity status',
        populate: {
          path: 'routeId',
          select: 'routeName routeNumber startPoint endPoint'
        }
      })
      .populate('appliedRouteId', 'routeName routeNumber startPoint endPoint')
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending student registrations
const getPendingRegistrations = async (req, res) => {
  try {
    const pendingStudents = await Student.find({ 
      isApproved: false,
      isRejected: false,
      isDeleted: false 
    })
    .select("-password")
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      pendingRegistrations: pendingStudents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bus registration requests
const getBusRequests = async (req, res) => {
  try {
    const busRequests = await Student.find({ 
      busRegistrationStatus: 'pending',
      isDeleted: false 
    })
    .populate('appliedRouteId', 'routeName routeNumber startPoint endPoint')
    .select("-password")
    .sort({ applicationDate: -1 });

    res.json({
      success: true,
      busRequests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/Reject student registration
const handleStudentRegistration = async (req, res) => {
  try {
    const { studentId, action, reason } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (action === 'approve') {
      student.isApproved = true;
      student.isRejected = false;
      student.rejectionReason = null;
      // Set default year if missing
      if (!student.year) {
        student.year = '1st Year';
      }
    } else if (action === 'reject') {
      student.isApproved = false;
      student.isRejected = true;
      student.rejectionReason = reason;
    }

    await student.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Student registration ${action}d successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/Reject bus application
const handleBusRequest = async (req, res) => {
  try {
    const { studentId, action, busId, reason } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (action === 'approve') {
      student.busRegistrationStatus = 'approved';
      student.busId = busId;
      student.approvalDate = new Date();
      student.rejectionReason = null;
      
      // Get bus and route details for notification
      const bus = await Bus.findById(busId).populate('routeId', 'routeName');
      
      // Send approval notification
      await createNotification(
        student._id,
        'Bus Application Approved',
        `Congratulations! Your bus application has been approved. You are now assigned to bus ${bus.busNumber}${bus.routeId ? ` on route ${bus.routeId.routeName}` : ''}.`,
        'success'
      );
      
      // Emit real-time notification
      if (global.io) {
        global.io.to(`student-${student._id}`).emit('busRequestApproved', {
          message: `Your bus application has been approved`,
          busNumber: bus.busNumber,
          routeName: bus.routeId?.routeName,
          timestamp: new Date()
        });
      }
    } else if (action === 'reject') {
      student.busRegistrationStatus = 'rejected';
      student.rejectionDate = new Date();
      student.rejectionReason = reason;
      
      // Send rejection notification
      await createNotification(
        student._id,
        'Bus Application Rejected',
        `Your bus application has been rejected. Reason: ${reason || 'No reason provided'}. You can apply again after addressing the concerns.`,
        'error'
      );
      
      // Emit real-time notification
      if (global.io) {
        global.io.to(`student-${student._id}`).emit('busRequestRejected', {
          message: `Your bus application has been rejected`,
          reason: reason || 'No reason provided',
          timestamp: new Date()
        });
      }
    }

    await student.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Bus request ${action}d successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Block/Suspend student
const updateStudentStatus = async (req, res) => {
  try {
    const { studentId, status, reason } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.status = status; // active, suspended, blocked
    if (status !== 'active') {
      student.rejectionReason = reason;
    }

    await student.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Student status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send announcement to students
const sendAnnouncement = async (req, res) => {
  try {
    console.log('Received announcement request:', req.body);
    console.log('User info:', req.user);
    
    const { title, message, type, priority, targetAudience, expiryDate } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    const announcement = new Announcement({
      title,
      message,
      type: type || 'info',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      expiryDate: expiryDate ? new Date(expiryDate) : null
    });

    console.log('Saving announcement:', announcement);
    await announcement.save();
    console.log('Announcement saved successfully');

    res.json({
      success: true,
      message: 'Announcement sent successfully',
      announcement
    });
  } catch (error) {
    console.error('Announcement error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.stack
    });
  }
};

// Get all announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { expiryDate: { $gte: new Date() } },
        { expiryDate: null }
      ]
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new student
const addStudent = async (req, res) => {
  try {
    const { name, email, password, studentId, phone, address } = req.body;

    const existingStudent = await Student.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this email or student ID already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      name,
      email,
      password: hashedPassword,
      studentId,
      phone,
      address,
      role: "student",
      isVerified: false
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      student: { ...student.toObject(), password: undefined }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Group buses by status
const GruopBus = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { isDeleted: false };
    if (status) {
      filter.status = status;
    }
    
    const buses = await Bus.find(filter)
      .populate("driverId", "name email")
      .populate("routeId", "routeName routeNumber")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new bus
const addBus = async (req, res) => {
  try {
    console.log('Add bus request body:', req.body);
    const { busNumber, model, registrationNumber, capacity, manufacturingYear, status } = req.body;
    
    // Validate required fields
    if (!busNumber || !model || !registrationNumber || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: busNumber, model, registrationNumber, capacity"
      });
    }
    
    const existingBus = await Bus.findOne({
      $or: [{ busNumber }, { registrationNumber }],
      isDeleted: false
    });

    if (existingBus) {
      return res.status(400).json({
        success: false,
        message: "Bus with this number or registration already exists"
      });
    }

    const bus = new Bus({
      busNumber,
      model,
      registrationNumber,
      capacity: parseInt(capacity),
      manufacturingYear: manufacturingYear ? parseInt(manufacturingYear) : undefined,
      status: status || 'active'
    });
    
    console.log('Creating bus:', bus);
    await bus.save();

    // Create notification
    await createNotification(
      req.user.id,
      'New Bus Added',
      `Bus ${busNumber} (${model}) has been added to the system`,
      'success'
    );

    res.status(201).json({
      success: true,
      message: "Bus added successfully",
      bus
    });
  } catch (error) {
    console.error('Add bus error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`) : []
    });
  }
};

// Add new route
const addRoute = async (req, res) => {
  try {
    console.log('Add route request body:', req.body);
    const { routeName, startPoint, endPoint, distance, estimatedTime, stops, description, status } = req.body;
    
    // Validate required fields
    if (!routeName || !startPoint || !endPoint || !distance || !estimatedTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: routeName, startPoint, endPoint, distance, estimatedTime"
      });
    }

    // Generate unique route number (check both active and deleted routes)
    let routeNumber;
    let counter = 1;
    
    do {
      routeNumber = `RT${String(counter).padStart(3, '0')}`;
      const existingRoute = await Route.findOne({ routeNumber });
      
      if (!existingRoute) {
        break;
      }
      counter++;
    } while (counter <= 999);
    
    const route = new Route({
      routeName,
      routeNumber,
      startPoint,
      endPoint,
      distance: parseFloat(distance),
      estimatedTime: parseInt(estimatedTime),
      stops: stops || '',
      description: description || '',
      status: status || 'active'
    });
    
    await route.save();

    res.status(201).json({
      success: true,
      message: "Route added successfully",
      route
    });
  } catch (error) {
    console.error('Route creation error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`) : []
    });
  }
};

// Add new driver
const addDriver = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      licenseNumber, 
      phoneNumber, 
      dateOfBirth,
      address, 
      emergencyContact,
      experience,
      licenseDocument,
      profileImage
    } = req.body;

    const existingDriver = await Driver.findOne({
      $or: [{ email }, { licenseNumber }],
      isDeleted: false
    });

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "Driver with this email or license number already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const driver = new Driver({
      name,
      email,
      password: hashedPassword,
      licenseNumber,
      phoneNumber,
      dateOfBirth,
      address,
      emergencyContact,
      experience,
      licenseDocument: licenseDocument ? {
        url: licenseDocument.url,
        publicId: licenseDocument.publicId
      } : undefined,
      profileImage: profileImage ? {
        url: profileImage.url,
        publicId: profileImage.publicId
      } : undefined,
      role: "driver",
      isVerified: true
    });

    await driver.save();

    // Create notification
    await createNotification(
      req.user.id,
      'New Driver Added',
      `Driver ${name} has been registered in the system`,
      'success'
    );

    res.status(201).json({
      success: true,
      message: "Driver added successfully",
      driver: { ...driver.toObject(), password: undefined }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    await Bus.updateMany({ driverId: id }, { driverId: null, routeId: null });

    await Driver.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    res.json({
      success: true,
      message: "Driver deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete bus
const deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if bus exists
    const bus = await Bus.findById(id).populate('driverId', 'name').populate('routeId', 'routeName');
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    // Get all students assigned to this bus
    const assignedStudents = await Student.find({ busId: id, isDeleted: false });
    
    console.log(`Bus deletion - Found ${assignedStudents.length} students assigned to bus ${bus.busNumber}`);
    assignedStudents.forEach(student => {
      console.log(`- Student: ${student.name} (${student._id})`);
    });
    
    // Send notifications to affected students
    for (const student of assignedStudents) {
      await createNotification(
        student._id,
        'Bus Service Discontinued',
        `Your assigned bus ${bus.busNumber} has been discontinued. Please contact admin for new bus assignment.`,
        'warning'
      );
    }

    // Remove bus assignment from all students and reset their status
    if (assignedStudents.length > 0) {
      await Student.updateMany(
        { busId: id },
        { 
          busId: null,
          busRegistrationStatus: 'not_registered',
          appliedRouteId: null,
          preferredPickupStop: null,
          applicationReason: null
        }
      );
    }

    // Mark bus as deleted
    await Bus.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      driverId: null,
      routeId: null
    });

    // Emit real-time notification to students
    if (global.io) {
      console.log(`Emitting bus deletion notifications to ${assignedStudents.length} students`);
      assignedStudents.forEach(student => {
        console.log(`Emitting to student room: student-${student._id}`);
        global.io.to(`student-${student._id}`).emit('busDeleted', {
          message: `Your bus ${bus.busNumber} has been discontinued`,
          busNumber: bus.busNumber,
          timestamp: new Date()
        });
      });
    } else {
      console.log('Socket.io not available for real-time notifications');
    }

    res.json({
      success: true,
      message: assignedStudents.length > 0 
        ? `Bus deleted successfully. ${assignedStudents.length} students have been notified and their assignments cleared.`
        : "Bus deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete route
const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    // Get route details before deletion
    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    // Find all buses using this route
    const affectedBuses = await Bus.find({ routeId: id, isDeleted: false }).populate('driverId', 'name');
    
    // Get all students on buses using this route
    const busIds = affectedBuses.map(bus => bus._id);
    const affectedStudents = await Student.find({ 
      $or: [
        { busId: { $in: busIds } },
        { appliedRouteId: id }
      ],
      isDeleted: false 
    });

    // Send notifications to affected students
    for (const student of affectedStudents) {
      const studentBus = affectedBuses.find(bus => bus._id.toString() === student.busId?.toString());
      await createNotification(
        student._id,
        'Route Discontinued',
        `Route "${route.routeName}" has been discontinued. ${studentBus ? `Your bus ${studentBus.busNumber} route will be updated soon.` : 'Please apply for a new route.'}`,
        'warning'
      );
    }

    // Clear route assignments from students
    await Student.updateMany(
      { appliedRouteId: id },
      { 
        appliedRouteId: null,
        busRegistrationStatus: 'not_registered',
        preferredPickupStop: null,
        applicationReason: null
      }
    );

    // Remove route from all buses
    await Bus.updateMany({ routeId: id }, { routeId: null });

    // Mark route as deleted
    await Route.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    // Emit real-time notifications
    if (global.io) {
      affectedStudents.forEach(student => {
        global.io.to(`student-${student._id}`).emit('routeDeleted', {
          message: `Route "${route.routeName}" has been discontinued`,
          routeName: route.routeName,
          timestamp: new Date()
        });
      });
    }

    res.json({
      success: true,
      message: `Route deleted successfully. ${affectedStudents.length} students have been notified and their route assignments cleared.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await Student.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    res.json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update bus status
const updateBusStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bus = await Bus.findById(id).populate('driverId', 'name').populate('routeId', 'routeName');
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    // Get students affected by this status change
    const affectedStudents = await Student.find({ busId: id, isDeleted: false });
    
    // Send notifications based on status change
    let notificationMessage = '';
    let notificationType = 'info';
    
    switch (status) {
      case 'maintenance':
        notificationMessage = `Your bus ${bus.busNumber} is under maintenance. Service may be temporarily affected.`;
        notificationType = 'warning';
        break;
      case 'inactive':
        notificationMessage = `Your bus ${bus.busNumber} service has been temporarily suspended. Please contact admin.`;
        notificationType = 'error';
        break;
      case 'active':
        notificationMessage = `Your bus ${bus.busNumber} is now active and ready for service.`;
        notificationType = 'success';
        break;
    }

    // Send notifications to affected students
    for (const student of affectedStudents) {
      await createNotification(
        student._id,
        'Bus Status Update',
        notificationMessage,
        notificationType
      );
    }

    // Update bus status
    await Bus.findByIdAndUpdate(id, { status });

    // Create notification for admin
    await createNotification(
      req.user.id,
      'Bus Status Updated',
      `Bus ${bus.busNumber} status changed to ${status}`,
      status === 'maintenance' ? 'warning' : 'info'
    );

    // Emit real-time notifications
    if (global.io) {
      affectedStudents.forEach(student => {
        global.io.to(`student-${student._id}`).emit('busStatusChanged', {
          message: notificationMessage,
          busNumber: bus.busNumber,
          status: status,
          timestamp: new Date()
        });
      });
    }

    res.json({
      success: true,
      message: `Bus status updated successfully. ${affectedStudents.length} students have been notified.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign/Unassign bus to driver
const assignBusToDriver = async (req, res) => {
  try {
    const { driverId, busId, routeId, action } = req.body;

    if (action === 'unassign') {
      const bus = await Bus.findOne({ driverId, isDeleted: false }).populate('driverId', 'name');
      if (bus) {
        // Get students affected by this change
        const affectedStudents = await Student.find({ busId: bus._id, isDeleted: false });
        
        // Notify students about driver change
        for (const student of affectedStudents) {
          await createNotification(
            student._id,
            'Driver Unassigned',
            `Driver has been unassigned from your bus ${bus.busNumber}. A new driver will be assigned soon.`,
            'info'
          );
        }

        await Bus.findByIdAndUpdate(bus._id, { driverId: null, routeId: null });

        // Emit real-time notification
        if (global.io) {
          affectedStudents.forEach(student => {
            global.io.to(`student-${student._id}`).emit('driverUnassigned', {
              message: `Driver unassigned from bus ${bus.busNumber}`,
              busNumber: bus.busNumber,
              timestamp: new Date()
            });
          });
        }
      }

      return res.json({
        success: true,
        message: "Bus unassigned successfully"
      });
    }

    // Check if driver already has a bus assigned
    const driverCurrentBus = await Bus.findOne({ driverId, isDeleted: false });
    if (driverCurrentBus) {
      return res.status(400).json({
        success: false,
        message: "Driver already has a bus assigned. Please unassign first."
      });
    }

    // Check if bus is already assigned to another driver
    const busToAssign = await Bus.findById(busId);
    if (busToAssign.driverId) {
      return res.status(400).json({
        success: false,
        message: "Bus is already assigned to another driver"
      });
    }

    // Get students who will be affected by this assignment
    const affectedStudents = await Student.find({ busId: busId, isDeleted: false });
    
    // Assign bus to driver
    await Bus.findByIdAndUpdate(busId, { driverId, routeId });
    
    const driver = await Driver.findById(driverId);
    const bus = await Bus.findById(busId);
    const route = routeId ? await Route.findById(routeId) : null;

    // Notify affected students about new driver assignment
    for (const student of affectedStudents) {
      await createNotification(
        student._id,
        'New Driver Assigned',
        `${driver.name} has been assigned as your new bus driver for ${bus.busNumber}${route ? ` on route ${route.routeName}` : ''}.`,
        'success'
      );
    }

    // Create notification for admin
    await createNotification(
      req.user.id,
      'Bus Assignment',
      `Bus ${bus.busNumber} has been assigned to driver ${driver.name}`,
      'info'
    );

    // Emit real-time notifications
    if (global.io) {
      affectedStudents.forEach(student => {
        global.io.to(`student-${student._id}`).emit('driverAssigned', {
          message: `New driver ${driver.name} assigned to your bus`,
          driverName: driver.name,
          busNumber: bus.busNumber,
          routeName: route?.routeName,
          timestamp: new Date()
        });
      });
    }

    res.json({
      success: true,
      message: "Bus assigned successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unassign bus from driver
const unassignBusFromDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    const bus = await Bus.findOne({ driverId, isDeleted: false });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "No bus assigned to this driver"
      });
    }

    await Bus.findByIdAndUpdate(bus._id, { driverId: null, routeId: null });

    res.json({
      success: true,
      message: "Bus unassigned successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get driver by ID
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findOne({ _id: id, isDeleted: false })
      .select("-password");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    // Add assigned bus info
    const assignedBus = await Bus.findOne({ 
      driverId: driver._id, 
      isDeleted: false 
    }).populate('routeId', 'routeName routeNumber startPoint endPoint');
    
    const driverWithBusInfo = {
      ...driver.toObject(),
      assignedBus: assignedBus ? {
        _id: assignedBus._id,
        busNumber: assignedBus.busNumber,
        model: assignedBus.model,
        capacity: assignedBus.capacity,
        route: assignedBus.routeId
      } : null
    };

    res.json({
      success: true,
      driver: driverWithBusInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bus by ID
const getBusById = async (req, res) => {
  try {
    const { id } = req.params;

    const bus = await Bus.findOne({ _id: id, isDeleted: false })
      .populate("driverId", "name email")
      .populate("routeId", "routeName routeNumber");

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    res.json({
      success: true,
      bus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get route by ID
const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await Route.findOne({ _id: id, isDeleted: false });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    res.json({
      success: true,
      route
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Update driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle profile image and license document updates
    if (updateData.profileImage) {
      updateData.profileImage = {
        url: updateData.profileImage.url,
        publicId: updateData.profileImage.publicId,
        uploadedAt: new Date()
      };
    }

    if (updateData.licenseDocument) {
      updateData.licenseDocument = {
        url: updateData.licenseDocument.url,
        publicId: updateData.licenseDocument.publicId,
        uploadedAt: new Date()
      };
    }

    const driver = await Driver.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    ).select("-password");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.json({
      success: true,
      message: "Driver updated successfully",
      driver
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update bus
const updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const bus = await Bus.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    )
    .populate("driverId", "name email")
    .populate("routeId", "routeName routeNumber");

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    res.json({
      success: true,
      message: "Bus updated successfully",
      bus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update route
const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const route = await Route.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    res.json({
      success: true,
      message: "Route updated successfully",
      route
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student bus assignment
const updateStudentBusAssignment = async (req, res) => {
  try {
    const { studentId, busId } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Update student's bus assignment
    student.busId = busId;
    await student.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Student bus assignment updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllDrivers,
  getAllBuses,
  getAllRoutes,
  getAllStudents,
  getPendingRegistrations,
  getBusRequests,
  handleStudentRegistration,
  handleBusRequest,
  updateStudentStatus,
  sendAnnouncement,
  getAnnouncements,
  GruopBus,
  addBus,
  addRoute,
  addDriver,
  addStudent,
  deleteDriver,
  deleteBus,
  deleteRoute,
  deleteStudent,
  updateBusStatus,
  assignBusToDriver,
  unassignBusFromDriver,
  getDriverById,
  getBusById,
  getRouteById,
  updateDriver,
  updateBus,
  updateRoute,
  updateStudentBusAssignment
};