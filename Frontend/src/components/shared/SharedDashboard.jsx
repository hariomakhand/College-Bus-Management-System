import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,      
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useGetStatsQuery, useGetBusesQuery, useGetDriversQuery, useGetRoutesQuery, useGetStudentsQuery } from '../../store/apiSlice';
import { Bus, UserCheck, MapPin, Users, BarChart3, Activity, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const SharedDashboard = ({ type = 'admin' }) => {
  // RTK Query hooks
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetStatsQuery();
  const { data: buses, isLoading: busesLoading, error: busesError } = useGetBusesQuery();
  const { data: drivers, isLoading: driversLoading, error: driversError } = useGetDriversQuery();
  const { data: routes, isLoading: routesLoading, error: routesError } = useGetRoutesQuery();
  const { data: students, isLoading: studentsLoading, error: studentsError } = useGetStudentsQuery();

  const loading = statsLoading || busesLoading || driversLoading || routesLoading || studentsLoading;

  // Process data
  const busesArray = Array.isArray(buses) ? buses : [];
  const driversArray = Array.isArray(drivers) ? drivers : [];
  const routesArray = Array.isArray(routes) ? routes : [];
  const studentsArray = Array.isArray(students) ? students : [];
  
  // Calculate statistics
  const totalBuses = busesArray.length;
  const totalDrivers = driversArray.length;
  const totalRoutes = routesArray.length;
  const totalStudents = studentsError ? 0 : studentsArray.length;
  
  const activeBuses = busesArray.filter(bus => bus.status === 'active').length;
  const maintenanceBuses = busesArray.filter(bus => bus.status === 'maintenance').length;
  const inactiveBuses = busesArray.filter(bus => bus.status === 'inactive').length;
  
  const verifiedDrivers = driversArray.filter(driver => driver.isVerified).length;
  const verifiedStudents = studentsError ? 0 : studentsArray.filter(student => student.isVerified).length;
  const pendingStudents = studentsError ? 0 : studentsArray.filter(student => !student.isVerified).length;

  // Stats configuration based on type
  const getStatsConfig = () => {
    if (type === 'student') {
      return [
        { title: 'Available Routes', value: totalRoutes, color: 'bg-blue-500', icon: MapPin },
        { title: 'Active Buses', value: activeBuses, color: 'bg-green-500', icon: Bus },
        { title: 'Total Students', value: totalStudents, color: 'bg-purple-500', icon: Users },
        { title: 'Verified Drivers', value: verifiedDrivers, color: 'bg-orange-500', icon: UserCheck },
      ];
    }
    
    if (type === 'driver') {
      return [
        { title: 'Total Routes', value: totalRoutes, color: 'bg-blue-500', icon: MapPin },
        { title: 'Active Buses', value: activeBuses, color: 'bg-green-500', icon: Bus },
        { title: 'Total Students', value: totalStudents, color: 'bg-purple-500', icon: Users },
        { title: 'Other Drivers', value: totalDrivers - 1, color: 'bg-orange-500', icon: UserCheck },
      ];
    }
    
    // Default admin config - Gray and Yellow theme
    return [
      { title: 'Total Buses', value: totalBuses, color: 'bg-yellow-500', icon: Bus },
      { title: 'Active Drivers', value: verifiedDrivers, color: 'bg-gray-600', icon: UserCheck },
      { title: 'Total Routes', value: totalRoutes, color: 'bg-yellow-600', icon: MapPin },
      { title: 'Students', value: totalStudents, color: 'bg-gray-700', icon: Users },
    ];
  };

  const statsArray = getStatsConfig();

  // Chart data - Admin uses gray and yellow
  const barData = {
    labels: ['Buses', 'Drivers', 'Routes', 'Students'],
    datasets: [{
      label: 'Total Count',
      data: [totalBuses, totalDrivers, totalRoutes, totalStudents],
      backgroundColor: type === 'admin' ? [
        'rgba(234, 179, 8, 0.8)',
        'rgba(75, 85, 99, 0.8)',
        'rgba(202, 138, 4, 0.8)',
        'rgba(55, 65, 81, 0.8)'
      ] : [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderRadius: 8,
      borderWidth: 2,
      borderColor: type === 'admin' ? ['#EAB308', '#4B5563', '#CA8A04', '#374151'] : ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
    }],
  };

  const pieData = {
    labels: ['Active', 'Maintenance', 'Inactive'],
    datasets: [{
      data: [activeBuses, maintenanceBuses, inactiveBuses],
      backgroundColor: type === 'admin' ? ['#EAB308', '#CA8A04', '#6B7280'] : ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 4,
    }],
  };

  // Line Chart - Growth trend
  const currentMonth = new Date().getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last6Months = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
  
  const growthData = last6Months.map((_, index) => {
    const growthFactor = (index + 1) / last6Months.length;
    return Math.floor(totalBuses * (0.3 + growthFactor * 0.7));
  });
  
  const lineData = {
    labels: last6Months,
    datasets: [{
      label: 'Fleet Growth',
      data: growthData,
      borderColor: type === 'admin' ? '#EAB308' : '#3B82F6',
      backgroundColor: type === 'admin' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: type === 'admin' ? '#EAB308' : '#3B82F6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeInOutQuart' },
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3B82F6',
        borderWidth: 1,
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
      x: { grid: { display: false } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { animateRotate: true, animateScale: true, duration: 1000 },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15, font: { size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  if (statsError || busesError || driversError || routesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Dashboard</h3>
        <p className="text-red-600 mb-4">There was an error connecting to the backend.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsArray.map((stat, index) => (
          <div key={index} className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${type === 'admin' ? 'border-yellow-500' : 'border-blue-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                {stats?.busGrowth > 0 && (
                  <p className="text-green-600 text-xs mt-1">
                    ↗ +{stats.busGrowth}% from last month
                  </p>
                )}
              </div>
              <div className={`${stat.color} p-4 rounded-full text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Section - 3 Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="text-gray-800 mr-2" size={20} />
            <h3 className="text-lg font-bold text-gray-800">System Overview</h3>
            {loading && <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
          </div>
          <div className="h-64 relative">
            <Bar data={barData} options={chartOptions} />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Total System Entities: {totalBuses + totalDrivers + totalRoutes + totalStudents}
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Bus className="text-gray-800 mr-2" size={20} />
            <h3 className="text-lg font-bold text-gray-800">Bus Status</h3>
            {loading && <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>}
          </div>
          <div className="h-64 relative">
            {totalBuses === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">No buses available</p>
                  <p className="text-xs text-gray-400">Add buses to see analytics</p>
                </div>
              </div>
            ) : (
              <Pie data={pieData} options={pieOptions} />
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className={`w-3 h-3 ${type === 'admin' ? 'bg-yellow-500' : 'bg-green-500'} rounded-full mx-auto mb-1`}></div>
              <span className={`${type === 'admin' ? 'text-yellow-600' : 'text-green-600'} font-semibold`}>{activeBuses}</span>
              <p className="text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 ${type === 'admin' ? 'bg-yellow-600' : 'bg-yellow-500'} rounded-full mx-auto mb-1`}></div>
              <span className={`${type === 'admin' ? 'text-yellow-700' : 'text-yellow-600'} font-semibold`}>{maintenanceBuses}</span>
              <p className="text-gray-500">Maintenance</p>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 ${type === 'admin' ? 'bg-gray-600' : 'bg-red-500'} rounded-full mx-auto mb-1`}></div>
              <span className={`${type === 'admin' ? 'text-gray-600' : 'text-red-600'} font-semibold`}>{inactiveBuses}</span>
              <p className="text-gray-500">Inactive</p>
            </div>
          </div>
        </div>
        
        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-gray-800 mr-2" size={20} />
            <h3 className="text-lg font-bold text-gray-800">Growth Trend</h3>
            {loading && <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>}
          </div>
          <div className="h-64 relative">
            <Line data={lineData} options={chartOptions} />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Current Fleet Size: {totalBuses} buses
          </div>
        </div>
      </div>
      
      {/* Bottom Content - Activities and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Activity className="text-gray-800 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Live System Status</h3>
            <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 ${type === 'admin' ? 'bg-yellow-50' : 'bg-green-50'} rounded-lg`}>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${type === 'admin' ? 'bg-yellow-500' : 'bg-green-500'} rounded-full`}></div>
                <span className="text-sm text-gray-700">System Online</span>
              </div>
              <span className={`${type === 'admin' ? 'text-yellow-600' : 'text-green-600'} text-xs font-semibold`}>Active</span>
            </div>
            <div className={`flex items-center justify-between p-3 ${type === 'admin' ? 'bg-gray-100' : 'bg-blue-50'} rounded-lg`}>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${type === 'admin' ? 'bg-gray-600' : 'bg-blue-500'} rounded-full`}></div>
                <span className="text-sm text-gray-700">Drivers Registered</span>
              </div>
              <span className={`${type === 'admin' ? 'text-gray-700' : 'text-blue-600'} text-xs font-semibold`}>{totalDrivers}</span>
            </div>
            <div className={`flex items-center justify-between p-3 ${type === 'admin' ? 'bg-yellow-100' : 'bg-orange-50'} rounded-lg`}>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${type === 'admin' ? 'bg-yellow-600' : 'bg-orange-500'} rounded-full`}></div>
                <span className="text-sm text-gray-700">Buses in Maintenance</span>
              </div>
              <span className={`${type === 'admin' ? 'text-yellow-700' : 'text-orange-600'} text-xs font-semibold`}>{maintenanceBuses}</span>
            </div>
            <div className={`flex items-center justify-between p-3 ${type === 'admin' ? 'bg-gray-50' : 'bg-purple-50'} rounded-lg`}>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${type === 'admin' ? 'bg-gray-700' : 'bg-purple-500'} rounded-full`}></div>
                <span className="text-sm text-gray-700">Active Routes</span>
              </div>
              <span className={`${type === 'admin' ? 'text-gray-700' : 'text-purple-600'} text-xs font-semibold`}>{totalRoutes}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="text-gray-800 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Quick Analytics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bus Utilization</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${type === 'admin' ? 'bg-yellow-500' : 'bg-green-500'} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${totalBuses > 0 ? (activeBuses / totalBuses) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-semibold ${type === 'admin' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {totalBuses > 0 ? Math.round((activeBuses / totalBuses) * 100) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Driver Verification</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${type === 'admin' ? 'bg-gray-600' : 'bg-blue-500'} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${totalDrivers > 0 ? (verifiedDrivers / totalDrivers) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-semibold ${type === 'admin' ? 'text-gray-700' : 'text-blue-600'}`}>
                  {totalDrivers > 0 ? Math.round((verifiedDrivers / totalDrivers) * 100) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Student Verification</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${type === 'admin' ? 'bg-yellow-600' : 'bg-purple-500'} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${totalStudents > 0 ? (verifiedStudents / totalStudents) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-semibold ${type === 'admin' ? 'text-yellow-700' : 'text-purple-600'}`}>
                  {totalStudents > 0 ? Math.round((verifiedStudents / totalStudents) * 100) : 0}%
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className={`text-2xl font-bold ${type === 'admin' ? 'text-yellow-600' : 'text-green-600'}`}>{verifiedStudents}</p>
                  <p className="text-xs text-gray-500">Verified Students</p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${type === 'admin' ? 'text-gray-600' : 'text-orange-600'}`}>{pendingStudents}</p>
                  <p className="text-xs text-gray-500">Pending Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedDashboard;