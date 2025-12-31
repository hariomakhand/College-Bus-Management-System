import { Bus, Search, Plus, Trash2, Filter, Edit3, Users, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUpdateBusStatusMutation } from '../../store/apiSlice';
import EditBusModal from './EditBusModal';

const BusesTable = ({ buses, loading, deleteUser, openAddModal }) => {
  const [updateBusStatus] = useUpdateBusStatusMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingBus, setEditingBus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Debug logging
  // Debug logging
  useEffect(() => {
    if (buses && buses.length > 0) {
      console.log('🚌 BusesTable - Raw buses data:', buses);
      console.log('🚌 BusesTable - Total buses:', buses.length);
      
      // Check each bus for assignments
      buses.forEach((bus, index) => {
        console.log(`🚌 Bus ${index + 1} (${bus.busNumber}):`);
        console.log('  - Driver:', bus.driverId ? bus.driverId.name : 'Not Assigned');
        console.log('  - Route:', bus.routeId ? bus.routeId.routeName : 'Not Assigned');
        console.log('  - Full routeId object:', bus.routeId);
        console.log('  - Full driverId object:', bus.driverId);
      });
    }
  }, [buses]);

  const filteredBuses = buses?.filter(bus => {
    const matchesSearch = bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.capacity?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (busId, newStatus) => {
    try {
      await updateBusStatus({ id: busId, status: newStatus }).unwrap();
    } catch (error) {
      console.error('Failed to update bus status:', error);
    }
  };

  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setShowEditModal(true);
  };

  const statusCounts = {
    all: buses?.length || 0,
    active: buses?.filter(bus => bus.status === 'active').length || 0,
    maintenance: buses?.filter(bus => bus.status === 'maintenance').length || 0,
    inactive: buses?.filter(bus => bus.status === 'inactive').length || 0,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Left Side - Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <Bus size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Buses Management
            </h3>
            <p className="text-sm text-gray-600">
              Total: {buses?.length || 0} buses
            </p>
          </div>
        </div>

        {/* Right Side - Add Button */}
        <button
          onClick={() => openAddModal("bus")}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span className="sm:hidden">Add Bus</span>
          <span className="hidden sm:inline">Add New Bus</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search buses by number or capacity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Buses', color: 'bg-gray-100 text-gray-700' },
            { key: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
            { key: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-700' },
            { key: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-700' }
          ].map(status => (
            <button
              key={status.key}
              onClick={() => setStatusFilter(status.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === status.key 
                  ? 'ring-2 ring-blue-500 ' + status.color
                  : status.color + ' hover:-translate-y-0.5'
              }`}
            >
              {status.label} ({statusCounts[status.key]})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading buses...</span>
        </div>
      ) : filteredBuses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bus size={32} className="text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            No buses found
          </h4>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'No buses found matching your criteria.' 
              : 'Add your first bus to get started'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                  <th className="text-left p-4 font-semibold text-gray-700">Bus Info</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Capacity</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Assignment</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuses.map((bus, index) => (
                  <tr key={bus._id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bus size={16} className="text-blue-600" />
                        </div>
                        <div className="font-semibold text-gray-900">{bus.busNumber}</div>
                      </div>
                    </td>
                    
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-gray-500" />
                        <span className="font-medium">{bus.capacity} seats</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={bus.status}
                        onChange={(e) => handleStatusChange(bus._id, e.target.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                          bus.status === 'active' ? 'bg-green-100 text-green-800' : 
                          bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-gray-500">Driver:</span> 
                          <span className={`ml-1 font-medium ${
                            bus.driverId ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {bus.driverId?.name || 'Not Assigned'}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Route:</span> 
                          <span className={`ml-1 font-medium ${
                            bus.routeId ? 'text-purple-600' : 'text-red-600'
                          }`}>
                            {bus.routeId?.routeName || 'Not Assigned'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditBus(bus)}
                          className="text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Edit3 size={10} />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUser("buses", bus._id)}
                          className="text-red-600 hover:text-red-800 border border-red-200 hover:border-red-300 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredBuses.map((bus) => (
              <div key={bus._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bus size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{bus.busNumber}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Users size={12} />
                        {bus.capacity} seats
                      </div>
                    </div>
                  </div>
                  <select
                    value={bus.status}
                    onChange={(e) => handleStatusChange(bus._id, e.target.value)}
                    className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${
                      bus.status === 'active' ? 'bg-green-100 text-green-800' : 
                      bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Driver:</span>
                    <span className={`font-medium ${
                      bus.driverId ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {bus.driverId?.name || 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Route:</span>
                    <span className={`font-medium ${
                      bus.routeId ? 'text-purple-600' : 'text-red-600'
                    }`}>
                      {bus.routeId?.routeName || 'Not Assigned'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditBus(bus)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser("buses", bus._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mobile Summary */}
      {filteredBuses.length > 0 && (
        <div className="mt-4 md:hidden">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="text-lg font-bold text-green-700">
                {statusCounts.active}
              </div>
              <div className="text-xs text-green-600">Active</div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <div className="text-lg font-bold text-yellow-700">
                {statusCounts.maintenance}
              </div>
              <div className="text-xs text-yellow-600">Maintenance</div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <div className="text-lg font-bold text-red-700">
                {statusCounts.inactive}
              </div>
              <div className="text-xs text-red-600">Inactive</div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingBus && (
        <EditBusModal
          bus={editingBus}
          onClose={() => {
            setShowEditModal(false);
            setEditingBus(null);
          }}
          onUpdate={() => {
            // Refresh will happen automatically due to RTK Query cache invalidation
          }}
        />
      )}
    </div>
  );
};

export default BusesTable;