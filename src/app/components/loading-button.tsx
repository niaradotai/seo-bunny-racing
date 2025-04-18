"use client";

import { useState, useEffect } from "react";

// Text states for the button to cycle through
const BUTTON_TEXTS = [
    "Start Race",
    "Warming up bunnies...",
    "Getting PageSpeed scores...",
    "Almost there...",
];

// Interval in milliseconds between text changes
const CHANGE_INTERVAL = 30000; // 30 seconds

interface LoadingButtonProps {
    loading: boolean;
    onClick?: () => void;
    type?: "submit" | "button" | "reset";
}

export default function LoadingButton({
    loading,
    onClick,
    type = "submit",
}: LoadingButtonProps) {
    // Local state to store current text
    const [buttonText, setButtonText] = useState<string>(BUTTON_TEXTS[0]);

    useEffect(() => {
        // Reset button text when loading state changes to false
        if (!loading) {
            setButtonText(BUTTON_TEXTS[0]);
            return; // No need to set up interval when not loading
        }

        // Set initial loading state
        setButtonText(BUTTON_TEXTS[1]);

        let currentIndex = 1; // Start from index 1 (first loading state)

        // Set up interval to change text every 30 seconds
        const interval = setInterval(() => {
            // Move to next text state
            currentIndex = Math.min(currentIndex + 1, BUTTON_TEXTS.length - 1);
            setButtonText(BUTTON_TEXTS[currentIndex]);

            // If we've reached the last state, clear the interval
            if (currentIndex === BUTTON_TEXTS.length - 1) {
                clearInterval(interval);
            }
        }, CHANGE_INTERVAL);

        // Clean up interval when component unmounts or loading state changes
        return () => clearInterval(interval);
    }, [loading]); // Re-run effect only when loading state changes

    return (
        <button
            type={type}
            disabled={loading}
            onClick={onClick}
            className="flex gap-2 justify-center items-center w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {loading && (
                <div className="rabbit-running-sm flex w-40 h-30"></div>
            )}
            <span>{buttonText}</span>
        </button>
    );
}
