"use client";

import React, { useState } from 'react';

interface StatsData {
  totalRaces: number;
  topUrls: [string, number][];
  recentRaces: Record<string, unknown>[];
}

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!token) {
      setError('Please enter an admin token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/stats?token=${encodeURIComponent(token)}`);
      
      if (!response.ok) {
        throw new Error('Unauthorized or server error');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      setError('Failed to fetch statistics. Check your token and try again.');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">SEO Bunny Racing Admin Dashboard</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <div className="flex gap-4">
            <input 
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter admin token"
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button 
              onClick={fetchStats}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'View Stats'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-2">Total Races</h2>
                <p className="text-4xl font-bold text-blue-600">{stats.totalRaces}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-2">Unique URLs</h2>
                <p className="text-4xl font-bold text-green-600">{stats.topUrls.length}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-2">Recent Races</h2>
                <p className="text-4xl font-bold text-purple-600">{stats.recentRaces.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Top URLs</h2>
                <div className="overflow-auto max-h-80">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">URL</th>
                        <th className="p-2 text-right">Race Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topUrls.map(([url, count], index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2 truncate max-w-xs">{url}</td>
                          <td className="p-2 text-right">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Recent Race Results</h2>
                <div className="overflow-auto max-h-80">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2">Time</th>
                        <th className="p-2">URLs</th>
                        <th className="p-2">Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentRaces.map((race, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            {new Date(race.timestamp).toLocaleString()}
                          </td>
                          <td className="p-2">{race.urls?.length || 0} sites</td>
                          <td className="p-2">
                            {race.urls && race.winnerIndex !== undefined 
                              ? race.urls[race.winnerIndex]?.replace(/(^\w+:|^)\/\//, "").split("/")[0] 
                              : 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}