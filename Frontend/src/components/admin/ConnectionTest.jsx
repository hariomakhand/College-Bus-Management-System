import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
  const [status, setStatus] = useState('testing');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test multiple endpoints
        const endpoints = [
          { name: 'Stats', url: '/api/admin/stats' },
          { name: 'Buses', url: '/api/admin/buses' },
          { name: 'Drivers', url: '/api/admin/drivers' },
          { name: 'Routes', url: '/api/admin/routes' }
        ];
        
        const results = {};
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(`http://localhost:5001${endpoint.url}`, {
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              results[endpoint.name] = { status: 'success', count: Array.isArray(data) ? data.length : 'N/A', data };
            } else {
              results[endpoint.name] = { status: 'error', error: `${response.status}: ${response.statusText}` };
            }
          } catch (err) {
            results[endpoint.name] = { status: 'error', error: err.message };
          }
        }
        
        setData(results);
        setStatus('connected');
        console.log('Backend test results:', results);
      } catch (err) {
        setStatus('error');
        setError(err.message);
        console.error('Connection error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Backend Connection Status</h3>
      <div className="flex items-center space-x-3">
        {status === 'testing' && (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">Testing connection...</span>
          </>
        )}
        {status === 'connected' && (
          <>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-green-600">Backend connected successfully</span>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-red-600">Connection failed: {error}</span>
          </>
        )}
      </div>
      
      {data && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">Endpoint Status:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(data).map(([name, result]) => (
              <div key={name} className="flex justify-between items-center">
                <span className="text-blue-700">{name}:</span>
                <span className={result.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                  {result.status === 'success' ? `✓ ${result.count} items` : '✗ Error'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h4 className="font-semibold text-red-800 mb-2">Troubleshooting:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Make sure your backend server is running on port 5001</li>
            <li>• Check if the API endpoints exist in your backend</li>
            <li>• Verify CORS settings in your backend</li>
            <li>• Check browser console for more details</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;