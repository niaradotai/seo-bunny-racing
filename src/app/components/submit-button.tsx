"use client";

import { useState, useEffect } from "react";

type SubmitButtonProps = {
    loading: boolean;
    stateIndex: number;
    setStateIndex: (index: number) => void;
};

const buttonStates = [
    "Start Race",
    "Warming up bunnies...",
    "Getting PageSpeed scores...",
    "Race starting soon...",
];

const SubmitButton = ({
    loading,
    stateIndex,
    setStateIndex,
}: SubmitButtonProps) => {
    const [buttonText, setButtonText] = useState<string>(buttonStates[0]);

    useEffect(() => {
        // Set initial text based on loading state
        if (!loading) {
            setButtonText(buttonStates[0]);
            return;
        }

        // Apply the correct loading state text based on stateIndex
        setButtonText(
            buttonStates[stateIndex] || buttonStates[buttonStates.length - 1]
        );

        // Don't set up interval if we're at the last state
        if (stateIndex >= buttonStates.length - 1) return;

        // Set up interval to cycle through states
        const intervalId = setInterval(() => {
            setStateIndex((prevIndex) => {
                // Calculate next state index
                const nextIndex = prevIndex + 1;

                // Update text
                if (nextIndex < buttonStates.length) {
                    setButtonText(buttonStates[nextIndex]);
                }

                // Return next index (capped at max length)
                return Math.min(nextIndex, buttonStates.length - 1);
            });
        }, 15000); // 15 seconds

        // Cleanup interval on unmount or when dependencies change
        return () => clearInterval(intervalId);
    }, [loading, stateIndex, setStateIndex]);

    return (
        <button
            type="submit"
            disabled={loading}
            className="flex gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <div className="rabbit-running-sm flex w-40 h-30"></div>
            <span>{loading ? buttonText : buttonStates[0]}</span>
        </button>
    );
};

export default SubmitButton;
