import { useState } from "react";
import { useLogout } from "../hooks/useLogout";
import { useAuth } from "../Context/AuthContext";
import { BarChart3, Bus, Users, MapPin, UserCheck, LogOut, Home, Link, Menu, X } from 'lucide-react';
import NotificationPanel from '../components/NotificationPanel';
import AdminStudentManagement from '../components/AdminStudentManagement';
import { 
  useGetStatsQuery, 
  useGetBusesQuery, 
  useGetDriversQuery, 
  useGetRoutesQuery,
  useGetStudentsQuery,
  useAddBusMutation,
  useDeleteBusMutation,
  useUpdateBusStatusMutation,
  useAddDriverMutation,
  useDeleteDriverMutation,
  useAssignBusToDriverMutation,
  useUnassignBusFromDriverMutation,
  useAssignRouteToDriverMutation,
  useAddRouteMutation,
  useDeleteRouteMutation,
  useAddStudentMutation,
  useDeleteStudentMutation
} from "../store/apiSlice";

// Import admin components
import Dashboard from "../components/admin/Dashboard";
import BusesTable from "../components/admin/BusesTable";
import DriversTable from "../components/admin/DriversTable";
import RoutesTable from "../components/admin/RoutesTable";
import StudentsTable from "../components/admin/StudentsTable";
import AddModal from "../components/admin/AddModal";
import StudentApprovals from "../components/admin/StudentApprovals";
import AssignmentModal from "../components/admin/AssignmentModal";
import AssignmentOverview from "../components/admin/AssignmentOverview";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = useLogout();
  const { user } = useAuth();

  // RTK Query hooks - Real backend data
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetStatsQuery();
  const { data: buses, isLoading: busesLoading, error: busesError } = useGetBusesQuery();
  const { data: drivers, isLoading: driversLoading, error: driversError } = useGetDriversQuery();
  const { data: routes, isLoading: routesLoading, error: routesError } = useGetRoutesQuery();
  
  // Debug logging
  console.log('AdminPanel Data:', { stats, buses, drivers, routes });
  console.log('AdminPanel Errors:', { statsError, busesError, driversError, routesError });
  const { data: students, isLoading: studentsLoading, error: studentsError } = useGetStudentsQuery();

  // Mutations
  const [addBus] = useAddBusMutation();
  const [deleteBus] = useDeleteBusMutation();
  const [updateBusStatus] = useUpdateBusStatusMutation();
  const [addDriver] = useAddDriverMutation();
  const [deleteDriver] = useDeleteDriverMutation();
  const [addRoute] = useAddRouteMutation();
  const [deleteRoute] = useDeleteRouteMutation();
  const [addStudent] = useAddStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const [assignBusToDriver] = useAssignBusToDriverMutation();
  const [unassignBusFromDriver] = useUnassignBusFromDriverMutation();
  const [assignRouteToDriver] = useAssignRouteToDriverMutation();

  const [formData, setFormData] = useState({});

  // Handle Add Operations
  const handleAdd = async (e) => {
    e.preventDefault();
    console.log('Adding item:', modalType, formData);
    try {
      let result;
      if (modalType === "bus") {
        result = await addBus(formData).unwrap();
      } else if (modalType === "driver") {
        result = await addDriver(formData).unwrap();
      } else if (modalType === "route") {
        result = await addRoute(formData).unwrap();
      } else if (modalType === "student") {
        result = await addStudent(formData).unwrap();
      }
      console.log('Add result:', result);
      setShowAddModal(false);
      setFormData({});
      alert("Added successfully! ✅");
    } catch (err) {
      console.error("Add error details:", {
        error: err,
        status: err.status,
        data: err.data,
        message: err.message,
        originalStatus: err.originalStatus
      });
      
      let errorMessage = "Unknown error";
      if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.data?.error) {
        errorMessage = err.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.status) {
        errorMessage = `HTTP ${err.status} Error`;
      }
      
      alert("Failed to add: " + errorMessage);
    }
  };

  // Handle Delete Operations
  const handleDelete = async (type, id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      if (type === "buses") {
        await deleteBus(id).unwrap();
      } else if (type === "drivers") {
        await deleteDriver(id).unwrap();
      } else if (type === "routes") {
        await deleteRoute(id).unwrap();
      } else if (type === "students") {
        await deleteStudent(id).unwrap();
      }
      alert("Deleted successfully! ✅");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete: " + (err.data?.message || err.message || "Unknown error"));
    }
  };

  // Handle Bus Status Update
  const handleUpdateBusStatus = async (busId, status) => {
    try {
      await updateBusStatus({ id: busId, status }).unwrap();
      alert("Bus status updated successfully! ✅");
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status: " + (err.data?.message || err.message || "Unknown error"));
    }
  };

  // Handle Bus Toggle Filter
  const handleBusToggle = (status) => {
    setCurrentStatus(status);
  };

  // Handle Student Search
  const handleStudentSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle Assignments
  const handleAssignBus = async (driverId, busId, routeId = null) => {
    try {
      await assignBusToDriver({ driverId, busId, routeId }).unwrap();
      alert("Bus assigned successfully! ✅");
    } catch (err) {
      alert("Failed to assign bus: " + (err.data?.message || err.message));
    }
  };

  const handleAssignRoute = async (driverId, routeId) => {
    try {
      await assignRouteToDriver({ driverId, routeId }).unwrap();
      alert("Route assigned successfully! ✅");
    } catch (err) {
      alert("Failed to assign route: " + (err.data?.message || err.message));
    }
  };

  const handleUnassignBus = async (driverId) => {
    try {
      await unassignBusFromDriver(driverId).unwrap();
      alert("Bus unassigned successfully! ✅");
    } catch (err) {
      alert("Failed to unassign bus: " + (err.data?.message || err.message));
    }
  };

  // Open Add Modal
  const openAddModal = (type) => {
    setModalType(type);
    setFormData({});
    setShowAddModal(true);
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "assignments", name: "Assignments", icon: Link },
    { id: "buses", name: "Buses", icon: Bus },
    { id: "drivers", name: "Drivers", icon: UserCheck },
    { id: "routes", name: "Routes", icon: MapPin },
    { id: "students", name: "Students", icon: Users },
    { id: "approvals", name: "Approvals", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <div className={`w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-30 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UserCheck className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Bus Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>

        {/* User Info & Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          {/* Logout Button */}
          <button 
            onClick={async () => {
              await logout();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage {activeTab} in your system</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <NotificationPanel />
                <button 
                  onClick={() => window.location.href = "/"}
                  className="hidden sm:flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  <Home size={16} className="mr-1" /> 
                  <span className="hidden md:inline">Back to Home</span>
                  <span className="md:hidden">Home</span>
                </button>
                {/* Mobile Home Button */}
                <button 
                  onClick={() => window.location.href = "/"}
                  className="sm:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Home size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <Dashboard />
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <AssignmentOverview 
              drivers={drivers || []} 
              buses={buses || []} 
              routes={routes || []}
            />
          )}

          {/* Buses Tab */}
          {activeTab === "buses" && (
            <BusesTable 
              buses={buses || []} 
              loading={busesLoading}
              deleteUser={handleDelete}
              openAddModal={openAddModal}
            />
          )}

          {/* Drivers Tab */}
          {activeTab === "drivers" && (
            <DriversTable 
              drivers={drivers || []} 
              buses={buses || []}
              loading={driversLoading}
              setShowModal={setShowAddModal}
              setModalType={setModalType}
              setSelectedDriver={setSelectedDriver}
              setAssignModal={setAssignmentModal}
              handleUnassignBus={handleUnassignBus}
              deleteUser={handleDelete}
            />
          )}

          {/* Routes Tab */}
          {activeTab === "routes" && (
            <RoutesTable 
              routes={routes || []} 
              loading={routesLoading}
              setShowModal={setShowAddModal}
              setModalType={setModalType}
              deleteUser={handleDelete}
            />
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <StudentsTable 
              students={students || []} 
              loading={studentsLoading}
              deleteUser={handleDelete}
              searchTerm={searchTerm}
              handleStudentSearch={handleStudentSearch}
              openAddModal={openAddModal}
            />
          )}

          {/* Approvals Tab */}
          {activeTab === "approvals" && (
            <AdminStudentManagement />
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddModal 
          showModal={showAddModal}
          modalType={modalType}
          formData={formData}
          setFormData={setFormData}
          handleAddItem={handleAdd}
          setShowModal={setShowAddModal}
        />
      )}

      {/* Assignment Modal */}
      {assignmentModal && selectedDriver && (
        <AssignmentModal
          isOpen={assignmentModal}
          onClose={() => {
            setAssignmentModal(false);
            setSelectedDriver(null);
          }}
          driver={selectedDriver}
          buses={buses || []}
          routes={routes || []}
          onAssignBus={handleAssignBus}
          onAssignRoute={handleAssignRoute}
        />
      )}
    </div>
  );
}