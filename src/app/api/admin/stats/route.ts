import { NextRequest } from "next/server";
import redis from "../../../lib/redis";

export async function GET(req: NextRequest) {
  // Check for a simple admin token to restrict access
  const adminToken = req.nextUrl.searchParams.get('token');
  
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Gather various stats from Redis
    const [totalRaces, topUrls, recentResults] = await Promise.all([
      // Get total number of races
      redis.get('bunny_race_count'),
      
      // Get top 10 most used URLs
      redis.zrange('bunny_race_urls', 0, 9, { rev: true, withScores: true }),
      
      // Get 10 most recent race IDs
      redis.lrange('bunny_race_results', 0, 9)
    ]);
    
    // Get details of recent races
    const recentRaceDetails = await Promise.all(
      recentResults.map(async (id) => {
        return redis.hgetall(`bunny_race:${id}`);
      })
    );
    
    return Response.json({
      totalRaces: totalRaces || 0,
      topUrls,
      recentRaces: recentRaceDetails,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return Response.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}