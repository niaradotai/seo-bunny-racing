"use client";

import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../api/leaderboard/route';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/leaderboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        setError((err as Error).message || 'An error occurred');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  // Function to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-16 bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/assets/bg-scene.png)' }}>
      
      <div className="max-w-4xl w-full mx-auto p-8 bg-gray-800 bg-opacity-85 rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">SEO Bunny Racing Leaderboard</h1>
          <Link 
            href="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Back to Race
          </Link>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="rabbit-running mb-4"></div>
            <div className="text-white text-xl">Loading leaderboard data...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg text-white">
            <p>Error: {error}</p>
            <p className="mt-2">Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center">
              <div className="flex items-center mr-4">
                <span className="text-4xl mr-2">🏆</span>
                <span className="text-yellow-300 text-xl font-bold">Top PageSpeed Scores</span>
              </div>
              <div className="text-xs text-gray-400">
                Showing the highest score achieved by each website
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="bg-gray-700 bg-opacity-70">
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Website</th>
                    <th className="px-4 py-3 text-right">Best Score</th>
                    <th className="px-4 py-3 text-right">Wins</th>
                    <th className="px-4 py-3 text-right">Races</th>
                    <th className="px-4 py-3 text-right">Last Raced</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={entry.url} 
                      className={`${
                        index === 0 ? 'bg-yellow-900 bg-opacity-40' : 
                        index === 1 ? 'bg-gray-600 bg-opacity-40' : 
                        index === 2 ? 'bg-amber-800 bg-opacity-40' :
                        index % 2 === 0 ? 'bg-gray-700 bg-opacity-30' : 'bg-gray-800 bg-opacity-30'
                      } hover:bg-gray-700 transition-colors duration-150`}
                    >
                      <td className="px-4 py-3 font-bold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </td>
                      <td className="px-4 py-3 font-mono">{entry.url}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`
                          ${entry.score >= 90 ? 'text-green-400' : 
                            entry.score >= 70 ? 'text-yellow-300' : 
                            entry.score >= 50 ? 'text-orange-400' : 'text-red-400'} 
                          font-bold
                        `}>
                          {entry.score.toFixed(0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-yellow-300 font-bold">
                          {entry.wins > 0 ? `${entry.wins} 🏆` : '0'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">{entry.totalRaces}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{formatDate(entry.lastRaced)}</td>
                    </tr>
                  ))}
                  
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No websites have been raced yet. Be the first to add your website!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-400">
              <p>Race your website against others to get on the leaderboard!</p>
              <p className="mt-2">
                Higher PageSpeed scores = faster bunnies = higher ranking!
              </p>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-8 text-center text-sm text-white bg-black bg-opacity-50 py-2 px-4 rounded-lg">
        Game created by <a href="https://niara.ai" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">Niara.ai</a>. 🐰 Happy Easter!
      </div>
    </div>
  );
}