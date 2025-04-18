import { NextResponse } from "next/server";
import redis from "../../../lib/redis";
import { RaceResult } from "../../results/route";

export type Url = {
    url: string;
    score: number;
    isWinner: boolean;
};

export type RaceResultData = {
    timestamp: number;
    urls: Url[];
    shareId: string;
};

// Function to fetch race result by share ID
async function getRaceResultByShareId(shareId: string) {
    if (!shareId || shareId.length < 4) {
        return { error: "Invalid share ID", status: 400 };
    }

    try {
        // Search for the race result by share ID
        // First, get all race IDs
        const raceIds = await redis.lrange("bunny_race_results", 0, 1000);

        // Iterate through them to find one with matching shareId
        let result: RaceResult | null = null;

        for (const raceId of raceIds) {
            const raceData = (await redis.hgetall(
                `bunny_race:${raceId}`
            )) as unknown as RaceResult;

            if (raceData && raceData.shareId === shareId) {
                result = raceData;
                break;
            }
        }

        if (!result) {
            return { error: "Race result not found", status: 404 };
        }

        const urls = result.urls.map((url, index) => ({
            url,
            score: result.scores[index],
            isWinner: index === result.winnerIndex,
        }));

        // Return the race data without sensitive information
        return {
            data: {
                timestamp: result.timestamp,
                urls,
                shareId: result.shareId,
            } as RaceResultData,
            status: 200,
        };
    } catch (error) {
        console.error("Error retrieving shared race result:", error);
        return { error: "Failed to retrieve shared race result", status: 500 };
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = await params;
    const result = await getRaceResultByShareId(id);

    if (result.error) {
        return NextResponse.json(
            { error: result.error },
            { status: result.status }
        );
    }

    return NextResponse.json(result.data);
}
