import React from 'react';
import { Users, Bus, MapPin, UserCheck, AlertCircle } from 'lucide-react';

const AssignmentOverview = ({ drivers, buses, routes }) => {
  // Get assignment data
  const assignedDrivers = drivers?.filter(driver => driver.assignedBus) || [];
  const unassignedDrivers = drivers?.filter(driver => !driver.assignedBus) || [];
  const assignedBuses = buses?.filter(bus => bus.driverId) || [];
  const unassignedBuses = buses?.filter(bus => !bus.driverId) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Assigned Drivers</p>
              <p className="text-2xl font-bold text-green-900">{assignedDrivers.length}</p>
            </div>
            <UserCheck className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Unassigned Drivers</p>
              <p className="text-2xl font-bold text-red-900">{unassignedDrivers.length}</p>
            </div>
            <Users className="text-red-600" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Assigned Buses</p>
              <p className="text-2xl font-bold text-blue-900">{assignedBuses.length}</p>
            </div>
            <Bus className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Available Buses</p>
              <p className="text-2xl font-bold text-yellow-900">{unassignedBuses.length}</p>
            </div>
            <AlertCircle className="text-yellow-600" size={24} />
          </div>
        </div>
      </div>

      {/* Active Assignments */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <UserCheck className="mr-2 text-green-600" size={20} />
          Active Driver Assignments
        </h3>
        
        {assignedDrivers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No active assignments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedDrivers.map((driver) => (
              <div key={driver._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="text-green-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Assigned Bus */}
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                    <Bus className="text-blue-600" size={16} />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Bus: {driver.assignedBus?.busNumber || 'N/A'}
                      </p>
                      <p className="text-xs text-blue-600">
                        {driver.assignedBus?.model} • {driver.assignedBus?.capacity} seats
                      </p>
                    </div>
                  </div>

                  {/* Assigned Route */}
                  {driver.assignedBus?.route && (
                    <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                      <MapPin className="text-purple-600" size={16} />
                      <div>
                        <p className="text-sm font-medium text-purple-900">
                          Route: {driver.assignedBus.route.routeName}
                        </p>
                        <p className="text-xs text-purple-600">
                          {driver.assignedBus.route.startPoint} → {driver.assignedBus.route.endPoint}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">📞</div>
                    <p className="text-sm text-gray-700">{driver.phoneNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unassigned Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unassigned Drivers */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 text-red-600" size={20} />
            Unassigned Drivers ({unassignedDrivers.length})
          </h3>
          
          {unassignedDrivers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">All drivers are assigned</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {unassignedDrivers.map((driver) => (
                <div key={driver._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-500">{driver.phoneNumber}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Available
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unassigned Buses */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Bus className="mr-2 text-yellow-600" size={20} />
            Available Buses ({unassignedBuses.length})
          </h3>
          
          {unassignedBuses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">All buses are assigned</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {unassignedBuses.map((bus) => (
                <div key={bus._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{bus.busNumber}</p>
                    <p className="text-sm text-gray-500">{bus.model} • {bus.capacity} seats</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    bus.status === 'active' ? 'bg-green-100 text-green-800' :
                    bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {bus.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentOverview;