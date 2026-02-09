import React, { useState } from 'react';
import SharedTable from '../shared/SharedTable';
import SharedModal from '../shared/SharedModal';
import EditBusModal from './EditBusModal';
import { useUpdateBusStatusMutation } from '../../store/apiSlice';

const BusesTable = ({ buses, loading, deleteUser, openAddModal }) => {
  const [updateBusStatus] = useUpdateBusStatusMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBus, setEditingBus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const columns = [
    {
      key: 'busNumber',
      label: 'Bus Number',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            🚌
          </div>
          <span className="font-semibold text-gray-800">{value}</span>
        </div>
      )
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (value) => `${value} seats`
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      render: (value, item) => (
        <select
          value={value}
          onChange={(e) => handleStatusChange(item._id, e.target.value)}
          className={`px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
            value === 'active' ? 'bg-yellow-500 text-gray-900' : 
            value === 'maintenance' ? 'bg-yellow-300 text-gray-800' : 'bg-gray-400 text-white'
          }`}
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      )
    },
    {
      key: 'assignment',
      label: 'Assignment',
      render: (_, item) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-gray-500">Driver:</span> 
            <span className={`ml-1 font-medium ${
              item.driverId ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              {item.driverId?.name || 'Not Assigned'}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">Route:</span> 
            <span className={`ml-1 font-medium ${
              item.routeId ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              {item.routeId?.routeName || 'Not Assigned'}
            </span>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <SharedTable
        title="Buses Management"
        data={buses || []}
        columns={columns}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAdd={() => openAddModal("bus")}
        onEdit={handleEditBus}
        onDelete={(bus) => deleteUser("buses", bus._id)}
        addButtonText="Add New Bus"
        actions={['edit', 'delete']}
      />
      
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
    </>
  );
};

export default BusesTable;