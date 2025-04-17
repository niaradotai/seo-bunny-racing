import { NextRequest } from "next/server";
import redis from "../../../lib/redis";
import { RaceResult } from "../../results/route";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const shareId = params.id;
    
    if (!shareId || shareId.length < 4) {
      return Response.json({ error: 'Invalid share ID' }, { status: 400 });
    }
    
    // Search for the race result by share ID
    // First, get all race IDs
    const raceIds = await redis.lrange('bunny_race_results', 0, 1000);
    
    // Iterate through them to find one with matching shareId
    let result: RaceResult | null = null;
    
    for (const raceId of raceIds) {
      const raceData = await redis.hgetall(`bunny_race:${raceId}`) as unknown as RaceResult;
      
      if (raceData && raceData.shareId === shareId) {
        result = raceData;
        break;
      }
    }
    
    if (!result) {
      return Response.json({ error: 'Race result not found' }, { status: 404 });
    }
    
    // Return the race data without sensitive information
    return Response.json({
      timestamp: result.timestamp,
      urls: result.urls,
      scores: result.scores,
      winnerIndex: result.winnerIndex,
      shareId: result.shareId
    });
  } catch (error) {
    console.error('Error retrieving shared race result:', error);
    return Response.json(
      { error: 'Failed to retrieve shared race result' },
      { status: 500 }
    );
  }
}