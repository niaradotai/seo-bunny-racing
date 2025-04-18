"use client";

import { useEffect, useState } from "react";
import styles from "./flip-counter.module.css";

interface FlipCounterProps {
  refreshInterval?: number;
}

export default function FlipCounter({ refreshInterval = 10000 }: FlipCounterProps) {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // Function to fetch race count
  const fetchRaceCount = async () => {
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch race count");
      }
      
      const data = await response.json();
      
      // Only trigger animation if the count changes
      if (data.totalRaces !== count) {
        setIsFlipping(true);
        setTimeout(() => {
          setCount(data.totalRaces);
          setTimeout(() => {
            setIsFlipping(false);
          }, 500); // Animation duration
        }, 500); // Half-way through the flip
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching race count:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch race count on initial load
    fetchRaceCount();

    // Set up interval to refresh count
    const intervalId = setInterval(fetchRaceCount, refreshInterval);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval, count]);

  // Convert count to array of digits - ensure at least 4 digits
  const digits = count.toString().padStart(4, "0").split("");

  return (
    <div className="flex flex-col items-center mt-6 mb-2">
      <p className="text-white text-sm mb-2 font-bold text-center">
        <span className="text-yellow-300">TOTAL RACES</span><br/>
        SINCE LAUNCH
      </p>
      
      <div className={styles.flipCounter}>
        {isLoading ? (
          <div className={styles.loadingPlaceholder}>
            <div className="bg-gray-700 animate-pulse w-40 h-16 rounded"></div>
          </div>
        ) : (
          <div className="flex">
            {digits.map((digit, index) => (
              <div 
                key={index} 
                className={`${styles.flipCard} ${isFlipping ? styles.flipping : ""}`}
              >
                <div className={styles.top}>{digit}</div>
                <div className={styles.bottom}>{digit}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}