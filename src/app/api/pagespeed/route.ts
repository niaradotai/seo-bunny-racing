import { NextRequest } from "next/server";

export type PageSpeedResult = {
    url: string;
    score: number;
};

type PageSpeedRequest = {
    urls: string[];
};

interface PageSpeedApiResponse {
    lighthouseResult?: {
        categories?: {
            performance?: {
                score?: number;
            };
        };
    };
}

export async function POST(req: NextRequest) {
    const { urls } = (await req.json()) as PageSpeedRequest;
    const key = process.env.PAGESPEED_API_KEY;

    const results: PageSpeedResult[] = await Promise.all(
        urls.map(async (url: string) => {
            const res = await fetch(
                `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
                    url
                )}&strategy=mobile&key=${key}`
            );
            const data = (await res.json()) as PageSpeedApiResponse;
            return {
                url,
                score:
                    (data?.lighthouseResult?.categories?.performance?.score ??
                        0) * 100 || 0,
            };
        })
    );

    return Response.json(results);
}
