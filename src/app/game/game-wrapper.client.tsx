// src/app/game/game-wrapper.client.tsx
"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import URLInputForm from "../components/URLInputForm";

// Import the game component with SSR disabled
const GameComponent = dynamic(() => import("./game-component"), {
    ssr: false,
});

export default function ClientGameWrapper() {
    const [urls, setUrls] = useState<string[]>([]);

    const handleUrlsSubmit = (urls: string[]) => {
        setUrls(urls);
    };

    return (
        <div>
            <URLInputForm onUrlsSubmit={handleUrlsSubmit} />
            <GameComponent urls={urls} />
        </div>
    );
}
