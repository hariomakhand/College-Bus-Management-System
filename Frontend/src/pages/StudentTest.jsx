import React from 'react';
import { useAuth } from '../Context/AuthContext';

const StudentTest = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Panel Test</h1>
        <p className="text-gray-600">Welcome, {user?.name || 'Student'}!</p>
        <p className="text-sm text-gray-500 mt-2">Role: {user?.role}</p>
        <p className="text-sm text-gray-500">Email: {user?.email}</p>
      </div>
    </div>
  );
};

export default StudentTest;