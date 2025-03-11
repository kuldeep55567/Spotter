"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// TypeScript interfaces
interface Log {
  log_id: number;
  log_time: string;
  status: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  miles_remaining: number | null;
  created_at: string;
  trip: number;
  user: number;
}

interface HOSSummary {
  summary_id: number;
  log_date: string;
  total_drive_time: string;
  total_duty_time: string;
  total_rest_time: string;
  available_drive_time: string;
  available_duty_time: string;
  updated_at: string;
  user: number;
}

interface ChartDataPoint {
  date: string;
  driveTime: number;
  dutyTime: number;
  restTime: number;
  availableDriveTime: number;
  availableDutyTime: number;
}

interface TripLogs {
  [key: number]: Log[];
}

interface UserData {
  user_id: string;
  user_key: string;
  name: string;
}

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [hosSummaries, setHosSummaries] = useState<HOSSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'hos'>('dashboard');
  const [selectedLog, setSelectedLog] = useState<Log[] | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userString = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (userString) {
          const userObj = JSON.parse(userString);
          setUserData({
            user_id: userObj.user_id || '1',
            user_key: accessToken || '',
            name: userObj.name || 'Driver'
          });
        } else {
          // No user found, redirect to login page
          console.log('No user found, redirecting to login...');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // If there's an error, better to redirect to login
        router.push('/login');
      }
    }
  }, [router]);


  // Fetch data on component mount
  useEffect(() => {
    // Only fetch when we have confirmed userData
    if(userData === null) return;
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        // Use a default API URL if the environment variable isn't set
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';

        const [logsResponse, hosResponse] = await Promise.all([
          axios.get<Log[]>(`${apiBaseUrl}user/${userData.user_id}/logs`, {
            // headers: userData.user_key ? { Authorization: `Bearer ${userData.user_key}` } : {}
          }),
          axios.get<HOSSummary[]>(`${apiBaseUrl}user/${userData.user_id}/hos`, {
            // headers: userData.user_key ? { Authorization: `Bearer ${userData.user_key}` } : {}
          })
        ]);

        setLogs(logsResponse.data);
        setHosSummaries(hosResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [userData]);

  // Group logs by trip
  const tripLogs: TripLogs = logs.reduce((acc: TripLogs, log: Log) => {
    if (!acc[log.trip]) {
      acc[log.trip] = [];
    }
    acc[log.trip].push(log);
    return acc;
  }, {});

  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for HOS graph
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split('.');
    return `${hours}h ${Math.round(Number(`0.${minutes || '0'}`) * 60)}m`;
  };

  // Convert HOS data for chart
  const chartData: ChartDataPoint[] = hosSummaries.map(summary => ({
    date: new Date(summary.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    driveTime: parseFloat(summary.total_drive_time),
    dutyTime: parseFloat(summary.total_duty_time),
    restTime: parseFloat(summary.total_rest_time),
    availableDriveTime: parseFloat(summary.available_drive_time),
    availableDutyTime: parseFloat(summary.available_duty_time)
  })).reverse();

  // Status color mapping
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'Driving': 'bg-green-500',
      'Off Duty': 'bg-blue-500',
      'On Duty': 'bg-yellow-500',
      'Sleeper Berth': 'bg-purple-500'
    };
    return statusColors[status] || 'bg-gray-500';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading dashboard data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center text-red-500 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="text-orange-500">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold"> {`${userData?.name}'s Dashboard`}</h1>
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'logs' ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'}`}
                onClick={() => setActiveTab('logs')}
              >
                Logs
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'hos' ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'}`}
                onClick={() => setActiveTab('hos')}
              >
                HOS Summary
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary Cards */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Driver Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-md p-4">
                  <h3 className="text-lg font-medium">Latest Status</h3>
                  <p className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(logs[0]?.status || '')}`}>
                    {logs[0]?.status || 'Unknown'}
                  </p>
                  <p className="mt-2 text-gray-600">{logs[0]?.description || 'No description'}</p>
                </div>
                <div className="bg-gray-100 rounded-md p-4">
                  <h3 className="text-lg font-medium">Today Stats</h3>
                  <div className="mt-2">
                    <p className="text-gray-600">Drive Time: {formatTime(hosSummaries[0]?.total_drive_time || '0.00')}</p>
                    <p className="text-gray-600">Duty Time: {formatTime(hosSummaries[0]?.total_duty_time || '0.00')}</p>
                    <p className="text-gray-600">Rest Time: {formatTime(hosSummaries[0]?.total_rest_time || '0.00')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* HOS Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Hours of Service - Last 7 Days</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value} hours`]} />
                    <Legend />
                    <Line type="monotone" dataKey="driveTime" stroke="#10B981" name="Drive Time" />
                    <Line type="monotone" dataKey="dutyTime" stroke="#F59E0B" name="Duty Time" />
                    <Line type="monotone" dataKey="restTime" stroke="#3B82F6" name="Rest Time" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Trips */}
            <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Trips</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(tripLogs).slice(0, 5).map(([tripId, logs]) => {
                      const latestLog = logs[logs.length - 1];
                      return (
                        <tr key={tripId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Trip #{tripId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(latestLog.status)}`}>
                              {latestLog.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{latestLog.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(latestLog.log_time)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => {
                                setSelectedLog(logs);
                                setActiveTab('logs');
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedLog ? `Trip #${selectedLog[0].trip} Logs` : 'All Trip Logs'}
              </h2>
              {selectedLog && (
                <button
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700"
                  onClick={() => setSelectedLog(null)}
                >
                  Back to All Logs
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(selectedLog || logs).map((log) => (
                    <tr key={log.log_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.log_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Trip #{log.trip}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.log_time)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'hos' && (
          <div className="grid grid-cols-1 gap-6">
            {/* HOS Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Hours of Service - Last 7 Days</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value} hours`]} />
                    <Legend />
                    <Line type="monotone" dataKey="driveTime" stroke="#10B981" name="Drive Time" />
                    <Line type="monotone" dataKey="dutyTime" stroke="#F59E0B" name="Duty Time" />
                    <Line type="monotone" dataKey="restTime" stroke="#3B82F6" name="Rest Time" />
                    <Line type="monotone" dataKey="availableDriveTime" stroke="#6B7280" name="Available Drive Time" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="availableDutyTime" stroke="#1F2937" name="Available Duty Time" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* HOS Detailed Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">HOS Daily Summary</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drive Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duty Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rest Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Drive</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Duty</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hosSummaries.map((summary) => (
                      <tr key={summary.summary_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(summary.log_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(summary.total_drive_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(summary.total_duty_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(summary.total_rest_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(summary.available_drive_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(summary.available_duty_time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ELD Log Graph */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">ELD Log Visualization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hosSummaries.slice(0, 2).map((summary) => (
                  <div key={summary.summary_id} className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-2">{new Date(summary.log_date).toLocaleDateString()}</h3>
                    <div className="h-24 bg-gray-100 relative">
                      {/* Duty Time Bar */}
                      <div
                        className="absolute h-6 bg-yellow-400 top-0"
                        style={{
                          width: `${Math.min(parseFloat(summary.total_duty_time) / 14 * 100, 100)}%`,
                          left: '0%'
                        }}
                      ></div>

                      {/* Drive Time Bar */}
                      <div
                        className="absolute h-6 bg-green-500 top-8"
                        style={{
                          width: `${Math.min(parseFloat(summary.total_drive_time) / 11 * 100, 100)}%`,
                          left: '0%'
                        }}
                      ></div>

                      {/* Rest Time Bar */}
                      <div
                        className="absolute h-6 bg-blue-500 top-16"
                        style={{
                          width: `${Math.min(parseFloat(summary.total_rest_time) / 10 * 100, 100)}%`,
                          left: '0%'
                        }}
                      ></div>

                      {/* Hour markers */}
                      {[...Array(14)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 h-24 border-l border-gray-300"
                          style={{ left: `${(i / 14) * 100}%` }}
                        >
                          <span className="text-xs text-gray-500 absolute -top-4">{i}h</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-400 mr-1"></div>
                        <span>Duty: {formatTime(summary.total_duty_time)}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 mr-1"></div>
                        <span>Drive: {formatTime(summary.total_drive_time)}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                        <span>Rest: {formatTime(summary.total_rest_time)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;