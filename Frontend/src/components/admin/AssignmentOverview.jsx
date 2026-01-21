import React, { useState } from 'react';
import { Users, Bus, MapPin, UserCheck, AlertCircle, Search, Filter, Eye, Phone, Mail } from 'lucide-react';

const AssignmentOverview = ({ drivers, buses, routes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, assigned, unassigned
  const [viewMode, setViewMode] = useState('cards'); // cards, table

  // Get assignment data
  const assignedDrivers = drivers?.filter(driver => driver.assignedBus) || [];
  const unassignedDrivers = drivers?.filter(driver => !driver.assignedBus) || [];
  const assignedBuses = buses?.filter(bus => bus.driverId) || [];
  const unassignedBuses = buses?.filter(bus => !bus.driverId && bus.status === 'active') || [];

  // Filter drivers based on search and status
  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.assignedBus?.busNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'assigned' && driver.assignedBus) ||
                         (filterStatus === 'unassigned' && !driver.assignedBus);
    
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards - Admin Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Assigned Drivers</p>
              <div className="text-3xl font-bold text-gray-900">{assignedDrivers.length}</div>
              <p className="text-green-600 text-xs mt-1">
                {drivers?.length > 0 ? Math.round((assignedDrivers.length / drivers.length) * 100) : 0}% of total drivers
              </p>
            </div>
            <div className="bg-green-500 p-4 rounded-full text-white shadow-lg">
              <UserCheck size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Unassigned Drivers</p>
              <div className="text-3xl font-bold text-gray-900">{unassignedDrivers.length}</div>
              <p className="text-red-600 text-xs mt-1">Need assignment</p>
            </div>
            <div className="bg-red-500 p-4 rounded-full text-white shadow-lg">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Assigned Buses</p>
              <div className="text-3xl font-bold text-gray-900">{assignedBuses.length}</div>
              <p className="text-blue-600 text-xs mt-1">In operation</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-full text-white shadow-lg">
              <Bus size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Available Buses</p>
              <div className="text-3xl font-bold text-gray-900">{unassignedBuses.length}</div>
              <p className="text-orange-600 text-xs mt-1">Ready to assign</p>
            </div>
            <div className="bg-orange-500 p-4 rounded-full text-white shadow-lg">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Eye className="mr-3 text-blue-600" size={24} />
            Driver Assignment Overview
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Drivers</option>
                <option value="assigned">Assigned Only</option>
                <option value="unassigned">Unassigned Only</option>
              </select>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredDrivers.length} of {drivers?.length || 0} drivers
            {searchTerm && ` matching "${searchTerm}"`}
            {filterStatus !== 'all' && ` (${filterStatus})`}
          </p>
        </div>

        {/* Driver List */}
        {filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No drivers found</h4>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No drivers match the current filter'}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => (
              <div key={driver._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                {/* Driver Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      driver.assignedBus ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {driver.assignedBus ? (
                        <UserCheck className="text-green-600" size={20} />
                      ) : (
                        <Users className="text-red-600" size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{driver.name}</h4>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    driver.assignedBus 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {driver.assignedBus ? 'Assigned' : 'Available'}
                  </span>
                </div>

                {/* Assignment Details */}
                <div className="space-y-3">
                  {driver.assignedBus ? (
                    <>
                      {/* Assigned Bus */}
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Bus className="text-blue-600" size={18} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">
                            Bus {driver.assignedBus.busNumber}
                          </p>
                          <p className="text-xs text-blue-600">
                            {driver.assignedBus.model} • {driver.assignedBus.capacity} seats
                          </p>
                        </div>
                      </div>

                      {/* Assigned Route */}
                      {driver.assignedBus.route ? (
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <MapPin className="text-purple-600" size={18} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-purple-900">
                              {driver.assignedBus.route.routeName}
                            </p>
                            <p className="text-xs text-purple-600">
                              {driver.assignedBus.route.startPoint} → {driver.assignedBus.route.endPoint}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <MapPin className="text-yellow-600" size={18} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-900">No Route Assigned</p>
                            <p className="text-xs text-yellow-600">Route can be assigned later</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="mx-auto mb-2 text-gray-400" size={24} />
                      <p className="text-sm text-gray-600">No assignments yet</p>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Phone className="text-gray-400" size={14} />
                        <span className="text-gray-700">{driver.phoneNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="text-gray-400" size={14} />
                        <span className="text-gray-700 truncate max-w-24">{driver.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Bus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          driver.assignedBus ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {driver.assignedBus ? (
                            <UserCheck className="text-green-600" size={16} />
                          ) : (
                            <Users className="text-red-600" size={16} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        driver.assignedBus 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {driver.assignedBus ? 'Assigned' : 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.assignedBus ? (
                        <div>
                          <div className="font-medium">{driver.assignedBus.busNumber}</div>
                          <div className="text-gray-500">{driver.assignedBus.model}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.assignedBus?.route ? (
                        <div>
                          <div className="font-medium">{driver.assignedBus.route.routeName}</div>
                          <div className="text-gray-500">
                            {driver.assignedBus.route.startPoint} → {driver.assignedBus.route.endPoint}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No route</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.phoneNumber || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats for Unassigned Resources */}
      {(unassignedDrivers.length > 0 || unassignedBuses.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unassigned Drivers */}
          {unassignedDrivers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2 text-red-600" size={20} />
                Unassigned Drivers ({unassignedDrivers.length})
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {unassignedDrivers.slice(0, 5).map((driver) => (
                  <div key={driver._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Users className="text-red-600" size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-sm text-gray-500">{driver.phoneNumber || 'No phone'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      Available
                    </span>
                  </div>
                ))}
                {unassignedDrivers.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{unassignedDrivers.length - 5} more drivers
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Unassigned Buses */}
          {unassignedBuses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Bus className="mr-2 text-yellow-600" size={20} />
                Available Buses ({unassignedBuses.length})
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {unassignedBuses.slice(0, 5).map((bus) => (
                  <div key={bus._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Bus className="text-yellow-600" size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{bus.busNumber}</p>
                        <p className="text-sm text-gray-500">{bus.model} • {bus.capacity} seats</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      bus.status === 'active' ? 'bg-green-100 text-green-800' :
                      bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bus.status}
                    </span>
                  </div>
                ))}
                {unassignedBuses.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{unassignedBuses.length - 5} more buses
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentOverview;