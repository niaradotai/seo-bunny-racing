import { RaceResultData } from "@/app/api/share/[id]/route";
import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import ShareButton from "./share-button";
import Image from "next/image";
import Footer from "@/app/components/footer";

// Define the types for props
type PageProps = {
    params: { id: string };
    searchParams: Record<string, string | string[] | undefined>;
};

// Generate dynamic metadata for the page
export async function generateMetadata(
    { params }: PageProps,
    _parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    // Fetch race data
    const raceData = await fetchRaceData(id);

    // Determine winner website and score
    const winner = raceData?.urls?.find((url) => url.isWinner);
    const winnerName = winner.url
        ? winner.url.replace(/(^\w+:|^)\/\//, "").split("/")[0]
        : "Unknown Website";

    const winnerScore = winner.score ? Math.round(winner.score) : 0;

    // Base URL for absolute URLs
    const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        "https://seo-bunny-racing.vercel.app";

    const ogImageUrl = `${baseUrl}/api/og?winner=${encodeURIComponent(
        winnerName
    )}&score=${winnerScore}&count=${raceData?.urls?.length || 1}&id=${id}`;

    return {
        metadataBase: new URL(baseUrl),
        title: `${winnerName} wins SEO Bunny Racing with ${winnerScore} points!`,
        description: `Check out the SEO PageSpeed race results where ${winnerName} won with a score of ${winnerScore}. Race your own websites now!`,
        openGraph: {
            title: `${winnerName} wins SEO Bunny Racing with ${winnerScore} points!`,
            description: `Check out the SEO PageSpeed race results where ${winnerName} won with a score of ${winnerScore}. Race your own websites now!`,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: "SEO Bunny Racing Results",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${winnerName} wins SEO Bunny Racing!`,
            description: `Check out the SEO PageSpeed race results where ${winnerName} won with a score of ${winnerScore}.`,
            images: [ogImageUrl],
        },
    };
}

// Function to fetch race data from API
async function fetchRaceData(id: string) {
    try {
        // Use server-side fetch for the initial load
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            "https://seo-bunny-racing.vercel.app";
        const res = await fetch(`${baseUrl}/api/share/${id}`, {
            // next: { revalidate: 3600 },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch race data");
        }

        const result = (await res.json()) as RaceResultData;

        return result;
    } catch (error) {
        console.error("Error fetching shared race data:", error);
        return null;
    }
}

// Shared page component
export default async function SharePage({ params }: PageProps) {
    const { id } = await params;
    const raceData = await fetchRaceData(id);

    if (!raceData) {
        return (
            <div className="max-w-xl w-full mx-auto">
                <div className="flex justify-center mb-6">
                    <Image
                        src="/assets/logo.png"
                        width={200}
                        height={200}
                        alt="Bunny Racer"
                        className="block"
                    />
                </div>
                <h1 className="text-3xl font-bold mb-4">
                    Race Results Not Found
                </h1>
                <p className="mb-8">
                    The shared race results could not be found or may have
                    expired.
                </p>
                <Link
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                    Start Your Own Race
                </Link>
            </div>
        );
    }

    const winner = raceData?.urls?.find((url) => url.isWinner);
    const winnerUrl = winner?.url
        ? winner.url.replace(/(^\w+:|^)\/\//, "").split("/")[0]
        : "Unknown Website";

    const winnerScore = winner?.score ? Math.round(winner.score) : 0;
    const raceDate = new Date(raceData.timestamp).toLocaleString();

    return (
        <>
            <div className="max-w-3xl w-full mx-auto">
                <div className="flex justify-center mb-6">
                    <Link href="/">
                        <Image
                            src="/assets/logo.png"
                            width={200}
                            height={200}
                            alt="Bunny Racer"
                            className="block"
                        />
                    </Link>
                </div>
                <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                        Racing Results
                    </h1>

                    <div className="bg-gray-700 p-6 rounded-lg mb-8 border-2 border-yellow-500">
                        <h2 className="text-xl font-bold text-center mb-2 text-yellow-300">
                            🏆 WINNER 🏆
                        </h2>
                        <div className="flex items-center justify-center mb-4">
                            <div className="text-5xl mr-4">🐰</div>
                            <div>
                                <p className="text-xl font-bold">
                                    {
                                        winnerUrl
                                            .replace(/(^\w+:|^)\/\//, "")
                                            .split("/")[0]
                                    }
                                </p>
                                <p className="text-green-400 font-bold text-2xl">
                                    Score: {winnerScore}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="bg-gray-700 rounded-lg p-4">
                            {raceData.urls
                                .sort((a, b) => b.score - a.score)
                                .map((url, i: number) => (
                                    <div
                                        key={i}
                                        className={`flex justify-between items-center p-3 ${
                                            url.isWinner
                                                ? "bg-yellow-900 bg-opacity-30"
                                                : i % 2 === 0
                                                ? "bg-gray-800"
                                                : ""
                                        } rounded my-1`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-2 font-bold text-3xl">
                                                {url.isWinner
                                                    ? "🥇"
                                                    : i === 1
                                                    ? "🥈"
                                                    : "🥉"}
                                            </span>
                                            <Link
                                                href={`${url.url}?utm_source=niara.ai`}
                                                target="_blank"
                                            >
                                                {
                                                    url.url
                                                        .replace(
                                                            /(^\w+:|^)\/\//,
                                                            ""
                                                        )
                                                        .split("/")[0]
                                                }
                                            </Link>
                                        </div>
                                        <span className="font-mono">
                                            {Math.round(url.score)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="text-gray-400 text-sm mb-6">
                        <p>Race completed on {raceDate}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/leaderboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-center"
                        >
                            View Leaderboard 🏆
                        </Link>

                        <Link
                            href="/"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-center"
                        >
                            Race Again
                        </Link>

                        <ShareButton winner={winner} shareId={id} />
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
