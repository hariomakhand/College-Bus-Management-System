import axios from "axios";

export const API = axios.create({
  baseURL: "http://10.242.9.192:5001/api/auth",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

export const AdminAPI = axios.create({
  baseURL: "http://10.242.9.192:5001/api/admin",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

// Admin API functions
export const adminAPI = {
  // Dashboard
  getStats: () => AdminAPI.get('/stats'),
  
  // Drivers
  getDrivers: () => AdminAPI.get('/drivers'),
  getDriver: (id) => AdminAPI.get(`/drivers/${id}`),
  addDriver: (data) => AdminAPI.post('/drivers', data),
  deleteDriver: (id) => AdminAPI.delete(`/drivers/${id}`),
  
  // Buses
  getBuses: () => AdminAPI.get('/buses'),
  getBus: (id) => AdminAPI.get(`/buses/${id}`),
  addBus: (data) => AdminAPI.post('/buses', data),
  deleteBus: (id) => AdminAPI.delete(`/buses/${id}`),
  updateBusStatus: (id, status) => AdminAPI.put(`/buses/${id}/status`, { status }),
  
  // Routes
  getRoutes: () => AdminAPI.get('/routes'),
  getRoute: (id) => AdminAPI.get(`/routes/${id}`),
  addRoute: (data) => AdminAPI.post('/routes', data),
  deleteRoute: (id) => AdminAPI.delete(`/routes/${id}`),
  
  // Assignment
  assignBus: (data) => AdminAPI.put('/assign-bus', data)
};
