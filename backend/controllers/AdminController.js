
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
    } else if (action === 'reject') {
      student.busRegistrationStatus = 'rejected';
      student.rejectionDate = new Date();
      student.rejectionReason = reason;
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

    // Generate sequential route number starting from RT001
    const routeCount = await Route.countDocuments({ isDeleted: false });
    const routeNumber = `RT${String(routeCount + 1).padStart(3, '0')}`;
    
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
      experience 
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
    const bus = await Bus.findById(id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }

    // Check how many students are assigned to this bus
    const assignedStudents = await Student.countDocuments({ busId: id, isDeleted: false });
    
    // Remove bus assignment from all students
    if (assignedStudents > 0) {
      await Student.updateMany(
        { busId: id },
        { 
          busId: null,
          busRegistrationStatus: 'pending'
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

    res.json({
      success: true,
      message: assignedStudents > 0 
        ? `Bus deleted successfully. ${assignedStudents} students have been unassigned and their status reset to pending.`
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

    await Bus.updateMany({ routeId: id }, { routeId: null });

    await Route.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    res.json({
      success: true,
      message: "Route deleted successfully"
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

    const bus = await Bus.findById(id);
    await Bus.findByIdAndUpdate(id, { status });

    // Create notification
    await createNotification(
      req.user.id,
      'Bus Status Updated',
      `Bus ${bus.busNumber} status changed to ${status}`,
      status === 'maintenance' ? 'warning' : 'info'
    );

    res.json({
      success: true,
      message: "Bus status updated successfully"
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
      const bus = await Bus.findOne({ driverId, isDeleted: false });
      if (bus) {
        await Bus.findByIdAndUpdate(bus._id, { driverId: null, routeId: null });
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

    // Assign bus to driver
    await Bus.findByIdAndUpdate(busId, { driverId, routeId });
    
    const driver = await Driver.findById(driverId);
    const bus = await Bus.findById(busId);

    // Create notification
    await createNotification(
      req.user.id,
      'Bus Assignment',
      `Bus ${bus.busNumber} has been assigned to driver ${driver.name}`,
      'info'
    );

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

    res.json({
      success: true,
      driver
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