const express = require("express");
const AuthProtect = require("../middlewares/AuthProtect");
const roleMiddleware = require("../middlewares/roleMiddleware");
const validateDriver=require("../middlewares/validateDriver");
const BusValidation=require("../middlewares/BusValidation");
const RouteValidation=require("../middlewares/RouteValidation")

const {
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
  getDriverById,
  getBusById,
  getRouteById,
  addBus,
  GruopBus,
  addRoute,
  addDriver,
  addStudent,
  deleteDriver,
  deleteBus,
  deleteRoute,
  deleteStudent,
  updateBusStatus,
  updateDriver,
  updateBus,
  updateRoute,
  assignBusToDriver,
  unassignBusFromDriver,
  updateStudentBusAssignment
} = require("../controllers/AdminController");

const router = express.Router();

// All routes require admin authentication
router.use(AuthProtect);
router.use(roleMiddleware("admin"));

// Dashboard stats
router.get("/stats", getDashboardStats);



// Driver management
router.get("/drivers", getAllDrivers);
router.get("/drivers/:id", getDriverById);
router.post("/drivers",validateDriver, addDriver);
router.put("/drivers/:id", updateDriver);
router.delete("/drivers/:id", deleteDriver);

// Bus management
router.get("/buses", getAllBuses);
router.get("/buses/:id", getBusById);
router.post("/buses",BusValidation,  addBus);
router.put("/buses/:id", updateBus);
router.delete("/buses/:id", deleteBus);
router.put("/buses/:id/status", updateBusStatus);
router.get("/group", GruopBus);

// Route management
router.get("/routes", getAllRoutes);
router.get("/routes/:id", getRouteById);
router.post("/routes",RouteValidation, addRoute);
router.put("/routes/:id", updateRoute);
router.delete("/routes/:id", deleteRoute);

// Student management
router.get("/students", getAllStudents);
router.get("/pending-registrations", getPendingRegistrations);
router.get("/bus-requests", getBusRequests);
router.post("/students", addStudent);
router.post("/handle-registration", handleStudentRegistration);
router.post("/handle-bus-request", handleBusRequest);
router.post("/update-student-status", updateStudentStatus);
router.put("/update-student-bus", updateStudentBusAssignment);
// Test route
router.post("/test-announcement", (req, res) => {
  console.log('Test announcement route hit');
  console.log('Body:', req.body);
  res.json({ success: true, message: 'Test route working' });
});

router.post("/send-announcement", sendAnnouncement);
router.get("/announcements", getAnnouncements);
router.delete("/students/:id", deleteStudent);

// Bus and Route assignment
router.put("/assign-bus", assignBusToDriver);
router.put("/assign-route", assignBusToDriver);
router.put("/unassign-bus", unassignBusFromDriver);
router.put("/unassign-route", assignBusToDriver);

module.exports = router;