import React, { useState } from 'react';
import { Users, Search, Plus, Trash2, Eye } from 'lucide-react';

const StudentsTable = ({ students, loading, deleteUser, searchTerm, handleStudentSearch, openAddModal }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredStudents = students?.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Student Management
            </h3>
            <p className="text-sm text-gray-600">
              Total: {students?.length || 0} students
            </p>
          </div>
        </div>
        <button
          onClick={() => openAddModal("student")}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
        >
          + Add New Student
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => handleStudentSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No students found</h4>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700">Student Info</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Details</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student._id} className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                          {student.profileImage?.url ? (
                            <img 
                              src={student.profileImage.url} 
                              alt={student.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                              <Users size={20} className="text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-600">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-700">
                          ID: {student.studentId}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.department || 'Not specified'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.year || 'Not specified'}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDetailsModal(true);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => deleteUser("students", student._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
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
            {filteredStudents.map((student) => (
              <div key={student._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                    {student.profileImage?.url ? (
                      <img 
                        src={student.profileImage.url} 
                        alt={student.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <Users size={20} className="text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.email}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {student.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                
                <div className="space-y-1 mb-3 text-sm">
                  <div><span className="text-gray-500">ID:</span> <span className="font-medium">{student.studentId}</span></div>
                  <div><span className="text-gray-500">Department:</span> <span className="font-medium">{student.department || 'Not specified'}</span></div>
                  <div><span className="text-gray-500">Year:</span> <span className="font-medium">{student.year || 'Not specified'}</span></div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowDetailsModal(true);
                    }}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                  <button
                    onClick={() => deleteUser("students", student._id)}
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

      {/* Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-4 sm:p-6 border-b-2 border-gray-200 flex justify-between items-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {selectedStudent.name} - Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Photo Section */}
                <div className="md:col-span-2 flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                    {selectedStudent.profileImage?.url ? (
                      <img 
                        src={selectedStudent.profileImage.url} 
                        alt={selectedStudent.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <Users size={48} className="text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Personal Info</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedStudent.name}</p>
                    <p><strong>Email:</strong> {selectedStudent.email}</p>
                    <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
                    <p><strong>Phone:</strong> {selectedStudent.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Academic Info</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Department:</strong> {selectedStudent.department || 'Not specified'}</p>
                    <p><strong>Year:</strong> {selectedStudent.year || 'Not specified'}</p>
                    <p><strong>Status:</strong> {selectedStudent.isVerified ? 'Verified' : 'Pending'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Contact Info</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Address:</strong> {selectedStudent.address || 'Not provided'}</p>
                    <p><strong>Emergency Contact:</strong> {selectedStudent.emergencyContact || 'Not provided'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Bus Info</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Bus:</strong> {selectedStudent.busId?.busNumber || 'Not assigned'}</p>
                    <p><strong>Route:</strong> {selectedStudent.appliedRouteId?.routeName || 'Not assigned'}</p>
                    <p><strong>Bus Status:</strong> {selectedStudent.busRegistrationStatus || 'Not applied'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t-2 border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTable;