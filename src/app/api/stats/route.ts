import { NextResponse } from "next/server";
import redis from "../../lib/redis";

export async function GET() {
  try {
    // Get total race count from Redis
    const totalRaces = await redis.get("bunny_race_count") || "0";
    
    return NextResponse.json({ 
      totalRaces: parseInt(totalRaces as string, 10),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error fetching race statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch race statistics" },
      { status: 500 }
    );
  }
}