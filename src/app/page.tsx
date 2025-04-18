"use client";

import React, { useEffect, useRef, useState } from "react";
import URLInputForm from "./components/URLInputForm";
import { PageSpeedResult } from "./api/pagespeed/route";
import { RaceResultResponse } from "./api/results/route";
import Image from "next/image";
import Footer from "./components/footer";
import Link from "next/link";

type GamePhase = "start" | "input" | "countdown" | "race" | "results";

export default function HomePage() {
    const [phase, setPhase] = useState<GamePhase>("start");
    const [scores, setScores] = useState<PageSpeedResult[]>([]);
    const [countdown, setCountdown] = useState<number>(3);
    const [racePositions, setRacePositions] = useState<number[]>([]);
    const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareId, setShareId] = useState<string | null>(null);

    const rabbitRefs = useRef<(HTMLImageElement | null)[]>([]);
    const mainRef = useRef<HTMLDivElement>(null);

    // Handle Start Game button click
    const startGame = () => {
        setScores([]);
        setCountdown(3);
        setRacePositions([]);
        setWinnerIndex(null);
        setPhase("input");
    };

    // Handle URL form submit
    const onUrlsSubmit = async (inputUrls: string[]) => {
        setLoading(true);

        // Ensure we have at least 2 URLs
        if (inputUrls.length < 2) {
            alert(
                "Please enter at least 2 valid website URLs to start the race!"
            );
            setLoading(false);
            return;
        }

        // Limit to 3 URLs
        const limitedUrls = inputUrls.slice(0, 3);

        // Fetch scores from backend API
        try {
            const results = await fetch(`/api/pagespeed`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ urls: limitedUrls }),
            });
            const scores = (await results.json()) as PageSpeedResult[];
            setScores(scores);
            setPhase("countdown");
            setCountdown(3);
        } catch (error) {
            console.error(
                "Error fetching Page Speed scores: " + (error as Error).message
            );
            setPhase("input");
        } finally {
            setLoading(false);
        }
    };

    // Countdown effect
    useEffect(() => {
        if (phase !== "countdown") return;
        if (countdown === 0) {
            // Start race
            setPhase("race");
            // Initialize race positions at 0 for each rabbit
            setRacePositions(new Array(scores.length).fill(0));
            return;
        }
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, phase, scores.length]);

    // Race animation effect
    useEffect(() => {
        if (phase !== "race") return;
        if (racePositions.length === 0) return;

        // Reset finish line effect when race starts
        document
            .querySelector(".race-track")
            ?.classList.remove("finish-active");

        // Start race animation
        const raceInterval = setInterval(() => {
            setRacePositions((prevPositions) => {
                const newPositions = [...prevPositions];
                let raceFinished = false;

                // Update each rabbit's position based on their score
                scores.forEach((score, index) => {
                    // To ensure consistent results, ALWAYS make the highest-score rabbit win visually
                    // Find the max score among all rabbits
                    const maxScore = Math.max(...scores.map((s) => s.score));
                    const isHighestScore = score.score === maxScore;

                    // Calculate base and score-dependent speed component
                    // Note: this is cosmetic only - the ACTUAL winner is determined by highest score, not race position
                    const baseSpeed = 0.3;
                    const scoreComponent = (score.score / 100) * 0.4;

                    // CRITICAL: Give the rabbit with highest PageSpeed score a guaranteed speed advantage
                    let speed;
                    if (isHighestScore) {
                        // This rabbit has highest score, so it should finish first visually
                        const maxPossibleSpeed = 1.0; // Highest possible speed for any rabbit
                        speed = maxPossibleSpeed;
                    } else {
                        // Normal speed calculation for other rabbits based on their score
                        // but ensure they're always slower than the highest-scoring rabbit
                        speed = baseSpeed + scoreComponent;

                        // Cap to ensure it's slower than the highest score rabbit
                        speed = Math.min(speed, 0.8);
                    }
                    // Move each rabbit forward
                    newPositions[index] = Math.min(
                        newPositions[index] + speed,
                        100
                    );

                    // Check if any rabbit has finished the race
                    if (newPositions[index] >= 100) {
                        raceFinished = true;
                    }
                });

                // If race is finished, determine winner
                if (raceFinished) {
                    // Always determine the winner by the highest PageSpeed score
                    // This ensures the bunny with the best score always wins
                    const maxScore = Math.max(
                        ...scores.map((score) => score.score)
                    );
                    const winnerIdx = scores.findIndex(
                        (score) => score.score === maxScore
                    );
                    setWinnerIndex(winnerIdx);

                    // Activate finish line flash effect
                    document
                        .querySelector(".race-track")
                        ?.classList.add("finish-active");

                    // Set all positions past the finish line to hide them from view
                    scores.forEach((_, idx) => {
                        // Move all rabbits past the finish line (value over 100)
                        // This will hide them due to our CSS styling while maintaining the state
                        newPositions[idx] = 105;
                    });

                    // Save result to database
                    const saveResult = async () => {
                        try {
                            const response = await fetch("/api/results", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    urls: scores.map((score) => score.url),
                                    scores: scores.map((score) => score.score),
                                    // Ensure the winner is ALWAYS the highest PageSpeed score
                                    winnerIndex: winnerIdx,
                                }),
                            });

                            if (!response.ok) {
                                console.error("Failed to save race result");
                                return;
                            }

                            const result =
                                (await response.json()) as RaceResultResponse;
                            if (result.shareId) {
                                setShareId(result.shareId);
                            }
                        } catch (error) {
                            console.error("Error saving race result:", error);
                        }
                    };

                    saveResult();

                    // Wait longer before showing results to make the disappearing effect noticeable
                    setPhase("results");
                    clearInterval(raceInterval);
                }

                return newPositions;
            });
        }, 50);

        return () => clearInterval(raceInterval);
    }, [phase, racePositions.length, scores]);

    // Draw countdown on canvas
    useEffect(() => {
        if (phase !== "countdown") return;
    }, [countdown, phase]);

    // Function to open share modal
    const openShareModal = () => {
        if (!shareId) return;
        setShowShareModal(true);
    };

    // Function to share on social media
    const shareToSocial = (platform: string) => {
        if (!shareId || winnerIndex === null) return;

        const winnerName = scores[winnerIndex].url
            .replace(/(^\w+:|^)\/\//, "")
            .split("/")[0];
        const winnerScore = scores[winnerIndex].score.toFixed(0);

        // Create the share URL using the shareId
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/share/${shareId}`;
        const text = `Check out my SEO Bunny Racing results! Winner: ${winnerName} with score: ${winnerScore}`;

        let platformUrl = "";

        switch (platform) {
            case "twitter":
                platformUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    text
                )}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case "facebook":
                platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                )}&quote=${encodeURIComponent(text)}`;
                break;
            case "linkedin":
                platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    shareUrl
                )}&title=${encodeURIComponent(
                    "SEO Bunny Racing Results"
                )}&summary=${encodeURIComponent(text)}`;
                break;
            default:
                return;
        }

        window.open(platformUrl, "_blank", "width=600,height=400");
    };

    // Close the share modal
    const closeShareModal = () => {
        setShowShareModal(false);
    };

    return (
        <main
            ref={mainRef}
            className="flex flex-col items-center justify-center h-screen relative"
        >
            {phase === "start" && (
                <div className="relative bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-2xl text-white text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/assets/logo.png"
                            width={200}
                            height={200}
                            alt="Bunny Racer"
                            className="block"
                        />
                    </div>
                    <h2 className="text-xl mb-6">
                        Race your websites based on PageSpeed scores!
                    </h2>

                    <p className="mb-6 text-gray-300">
                        Enter 2-3 website URLs and watch them race based on
                        their PageSpeed scores. Faster websites = faster
                        bunnies!
                    </p>

                    <button
                        onClick={startGame}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 text-xl"
                    >
                        Start Racing!
                    </button>
                </div>
            )}

            {phase === "input" && (
                <URLInputForm onUrlsSubmit={onUrlsSubmit} loading={loading} />
            )}

            {phase === "countdown" && (
                <div className="absolute flex flex-col gap-4 bg-gray-800 bg-opacity-90 p-8 rounded-xl shadow-2xl text-center text-white max-w-md z-50">
                    <h1 className="text-3xl font-bold text-yellow-300">
                        Get Ready!
                    </h1>
                    <div className="flex justify-center my-2">
                        <div className="text-6xl">🐰</div>
                    </div>
                    <p className="text-xl">Race starts in:</p>
                    <div className="flex justify-center items-center">
                        <div className="bg-blue-600 rounded-full w-24 h-24 flex items-center justify-center">
                            <p className="text-6xl font-bold">{countdown}</p>
                        </div>
                    </div>
                </div>
            )}

            {phase === "results" && winnerIndex !== null && (
                <>
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/assets/logo.png"
                            width={200}
                            height={200}
                            alt="Bunny Racer"
                            className="block"
                        />
                    </div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 text-white shadow-xl border-2 border-yellow-500 max-w-xl w-full max-h-[calc(100vh-100px)] overflow-auto">
                            <h2 className="text-2xl font-bold mb-4 text-center text-white">
                                🏁 Race Result 🏁
                            </h2>
                            <div className="mb-6 bg-gray-900 bg-opacity-50 rounded-lg p-2">
                                {scores
                                    .sort((a, b) => b.score - a.score)
                                    .map((score, i) => (
                                        <div
                                            key={i}
                                            className={`flex justify-between items-center p-2 ${
                                                i === 0
                                                    ? "bg-yellow-900 bg-opacity-30"
                                                    : i % 2 === 0
                                                    ? "bg-gray-800 bg-opacity-50"
                                                    : ""
                                            } rounded my-1`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-2 font-bold text-3xl">
                                                    {i === 0
                                                        ? "🥇"
                                                        : i === 1
                                                        ? "🥈"
                                                        : "🥉"}
                                                </span>
                                                <span>
                                                    {
                                                        score.url
                                                            .replace(
                                                                /(^\w+:|^)\/\//,
                                                                ""
                                                            )
                                                            .split("/")[0]
                                                    }
                                                </span>
                                            </div>
                                            <span className="font-mono">
                                                {score.score}
                                            </span>
                                        </div>
                                    ))}
                            </div>

                            <div className="flex flex-col gap-4 mt-6">
                                <div className="text-center">
                                    <button
                                        onClick={openShareModal}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 mr-3"
                                    >
                                        Share Results
                                    </button>
                                    <button
                                        onClick={startGame}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                    >
                                        Race Again
                                    </button>
                                </div>

                                <div className="mt-2 text-center">
                                    <Link
                                        href="/leaderboard"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                                    >
                                        View Leaderboard 🏆
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Race track - Visible only during race (hidden during results) */}
            {phase === "race" && (
                <div className="fixed bottom-6 left-0 right-0 w-full px-8 pb-4">
                    <div className="bg-gray-800 bg-opacity-70 rounded-t-lg p-3 mb-0 text-white">
                        <h2 className="text-xl font-bold text-center">
                            SEO Bunny Racing
                        </h2>
                    </div>

                    <div
                        className="race-track relative w-full h-48 overflow-hidden bg-gray-800 bg-opacity-50 rounded-b-lg"
                        style={{ clipPath: "inset(0 0 0 0)" }}
                    >
                        {/* Start and finish lines */}
                        <div className="absolute left-0 top-0 h-full w-2 bg-white z-10"></div>
                        <div className="absolute right-0 top-0 h-full w-2 bg-white z-10 border-l-2 border-dashed border-black"></div>
                        <div className="finish-flash"></div>

                        {/* Race tracks */}
                        {scores.map((score, index) => (
                            <div
                                key={index}
                                className="relative h-14 mb-1 border-b border-gray-600"
                            >
                                {/* Lane number */}
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold">
                                    {index + 1}
                                </div>

                                {/* Running Rabbit Sprite */}
                                <div
                                    ref={(el) => {
                                        rabbitRefs.current[index] =
                                            el as HTMLImageElement;
                                    }}
                                    className={`absolute top-1/2 z-10 transition-all duration-50 ease-linear rabbit-running ${
                                        index === 0
                                            ? "rabbit-yellow"
                                            : index === 1
                                            ? "rabbit-blue"
                                            : index === 2
                                            ? "rabbit-green"
                                            : index === 3
                                            ? "rabbit-red"
                                            : "rabbit-purple"
                                    }`}
                                    style={{
                                        left: `${racePositions[index]}%`,
                                        transform:
                                            "translateX(-50%) translateY(-50%)",
                                        transformOrigin: "center",
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && shareId && winnerIndex !== null && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
                    <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">
                                Share Your Results
                            </h3>
                            <button
                                onClick={closeShareModal}
                                className="text-gray-400 hover:text-white text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold mb-2 text-gray-300">
                                Share this URL:
                            </h4>
                            <div className="flex">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/share/${shareId}`}
                                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-l text-sm text-white"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/share/${shareId}`
                                        );
                                        alert(
                                            "Share link copied to clipboard!"
                                        );
                                    }}
                                    className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-r text-white"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 mb-6">
                            <button
                                onClick={() => shareToSocial("twitter")}
                                style={{ backgroundColor: "#1DA1F2" }}
                                className="text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                            >
                                <span>Share on X / Twitter</span>
                            </button>
                            <button
                                onClick={() => shareToSocial("facebook")}
                                style={{ backgroundColor: "#4267B2" }}
                                className="text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                            >
                                <span>Share on Facebook</span>
                            </button>
                            <button
                                onClick={() => shareToSocial("linkedin")}
                                style={{ backgroundColor: "#0077B5" }}
                                className="text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                            >
                                <span>Share on LinkedIn</span>
                            </button>
                        </div>

                        <div className="text-gray-400 text-sm text-center">
                            <p>
                                Share your race results and challenge your
                                friends!
                            </p>
                        </div>

                        <div className="mt-4 text-center">
                            <Link
                                href="/leaderboard"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                            >
                                View Leaderboard 🏆
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
