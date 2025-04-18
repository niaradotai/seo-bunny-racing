"use client";

import { Url } from "@/app/api/share/[id]/route";
import Link from "next/link";
import React, { useState } from "react";

type ShareButtonProps = {
    shareId: string | null;
    winner: Url;
};

export default function ShareButton({ shareId, winner }: ShareButtonProps) {
    const [showShareModal, setShowShareModal] = useState(false);

    console.log("winner", winner);

    // Function to open share modal
    const openShareModal = () => {
        if (!shareId) return;
        setShowShareModal(true);
    };

    // Function to share on social media
    const shareToSocial = (platform: string) => {
        if (!shareId || winner === null) return;

        const winnerScore = winner.score;

        // Create the share URL using the shareId
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/share/${shareId}`;
        const text = `My website is the winner of the SEO Bunny Racing scoring ${winnerScore} on Page Speed!`;

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
        <>
            <button
                onClick={openShareModal}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-center"
            >
                Share Results
            </button>

            {/* Share Modal */}
            {showShareModal && shareId && winner !== null && (
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
        </>
    );
}
