import { NextRequest } from "next/server";
import redis from "../../lib/redis";
import { RaceResult } from "../results/route";

export interface LeaderboardEntry {
  url: string;
  score: number;
  totalRaces: number;
  wins: number;
  lastRaced: number;
}

export async function GET(req: NextRequest) {
  try {
    // Get all race IDs
    const raceIds = await redis.lrange('bunny_race_results', 0, -1);
    
    // Get all wins from Redis
    const winsData = await redis.zrange('bunny_race_wins', 0, -1, { withScores: true });
    
    // Convert wins data to a Map for easy lookup
    const winsMap = new Map<string, number>();
    for (let i = 0; i < winsData.length; i += 2) {
      const url = winsData[i] as string;
      const wins = Number(winsData[i + 1]) || 0;
      winsMap.set(url, wins);
    }
    
    // Map to store unique URLs and their highest scores
    const urlMap = new Map<string, LeaderboardEntry>();
    
    // Process all races
    for (const raceId of raceIds) {
      const raceData = await redis.hgetall(`bunny_race:${raceId}`) as unknown as RaceResult;
      
      if (raceData && raceData.urls && raceData.scores) {
        const timestamp = raceData.timestamp || Date.now();
        
        // Process each URL in the race
        raceData.urls.forEach((url, index) => {
          const score = raceData.scores[index] || 0;
          
          // Normalize URL for consistency
          const normalizedUrl = url.replace(/(^\w+:|^)\/\//, "").split("/")[0];
          
          // Get win count for this URL
          const wins = winsMap.get(normalizedUrl) || 0;
          
          // Update the URL entry in our map
          if (!urlMap.has(normalizedUrl)) {
            urlMap.set(normalizedUrl, {
              url: normalizedUrl,
              score: score,
              totalRaces: 1,
              wins: wins,
              lastRaced: timestamp
            });
          } else {
            const existing = urlMap.get(normalizedUrl)!;
            urlMap.set(normalizedUrl, {
              url: normalizedUrl,
              // Keep the highest score
              score: Math.max(existing.score, score),
              totalRaces: existing.totalRaces + 1,
              wins: wins, // Always use the latest wins count from Redis
              lastRaced: Math.max(existing.lastRaced, timestamp)
            });
          }
        });
      }
    }
    
    // Convert map to array and sort by score (highest first)
    const leaderboard = Array.from(urlMap.values())
      .sort((a, b) => b.score - a.score);
    
    return Response.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}