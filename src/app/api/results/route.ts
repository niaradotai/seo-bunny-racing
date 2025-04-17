import { NextRequest } from "next/server";
import redis from "../../lib/redis";

// Define the result data structure
export interface RaceResult {
  id: string;
  shareId: string;
  timestamp: number;
  urls: string[];
  scores: number[];
  winnerIndex: number;
  userAgent: string;
  ipAddress?: string;
  referrer?: string;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Create a unique ID for the race result - shorter for sharing
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const resultId = `race_${Date.now()}_${uniqueId}`;
    const shareId = uniqueId; // For public sharing
    
    // Get IP address from request headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Create the result object
    const result: RaceResult = {
      id: resultId,
      shareId,
      timestamp: Date.now(),
      urls: data.urls,
      scores: data.scores,
      winnerIndex: data.winnerIndex,
      userAgent: req.headers.get('user-agent') || 'unknown',
      ipAddress,
      referrer: req.headers.get('referer') || undefined,
    };
    
    // Store in Redis
    // 1. Add to a list of all race results
    await redis.lpush('bunny_race_results', resultId);
    
    // 2. Store the full result data as a hash
    await redis.hset(`bunny_race:${resultId}`, result);
    
    // 3. Increment total race count
    await redis.incr('bunny_race_count');
    
    // 4. Track URLs used in races
    for (const url of data.urls) {
      await redis.zincrby('bunny_race_urls', 1, url);
    }
    
    // 5. Increment the winner URL's win count
    if (data.winnerIndex !== undefined && data.urls[data.winnerIndex]) {
      const winnerUrl = data.urls[data.winnerIndex];
      // Normalize URL for consistency
      const normalizedWinnerUrl = winnerUrl.replace(/(^\w+:|^)\/\//, "").split("/")[0];
      await redis.zincrby('bunny_race_wins', 1, normalizedWinnerUrl);
    }
    
    return Response.json({ success: true, id: resultId, shareId });
  } catch (error) {
    console.error('Error storing race result:', error);
    return Response.json(
      { success: false, error: 'Failed to store result' },
      { status: 500 }
    );
  }
}