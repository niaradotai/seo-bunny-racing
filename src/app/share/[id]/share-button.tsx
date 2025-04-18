"use client";

import React from "react";

type ShareButtonProps = {
    title: string;
    text: string;
};

export default function ShareButton({ title, text }: ShareButtonProps) {
    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title,
                    text,
                    url: window.location.href,
                })
                .catch((err) => {
                    console.error("Error sharing:", err);
                });
        } else {
            // Fallback for browsers that don't support the Web Share API
            try {
                navigator.clipboard.writeText(window.location.href);
                alert("Share link copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-center"
        >
            Share Results
        </button>
    );
}
