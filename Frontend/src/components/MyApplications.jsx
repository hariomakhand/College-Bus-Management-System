import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/route-applications/my-applications`,
        { withCredentials: true }
      );
      setApplications(data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const icons = {
      pending: <AlertCircle size={16} />,
      approved: <CheckCircle size={16} />,
      rejected: <XCircle size={16} />
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${styles[status]}`}>
        {icons[status]} {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h2>
      
      {applications.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{app.routeId?.routeName}</h3>
                  <p className="text-sm text-gray-600">
                    {app.routeId?.startPoint} → {app.routeId?.endPoint}
                  </p>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Pickup Stop</p>
                  <p className="font-semibold">{app.pickupStop.name}</p>
                  {app.pickupStop.isNewStop && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">New Stop</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Time</p>
                  <p className="font-semibold flex items-center">
                    <Clock size={16} className="mr-1" />
                    {app.pickupStop.estimatedTime || 'N/A'}
                  </p>
                </div>
              </div>

              {app.reason && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="text-gray-800">{app.reason}</p>
                </div>
              )}

              {app.adminResponse && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Admin Response</p>
                  <p className="text-gray-800">{app.adminResponse}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">
                Applied: {new Date(app.applicationDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
