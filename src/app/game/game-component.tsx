"use client";

import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./phaser-game";

interface GameComponentProps {
    urls: string[];
}

function GameComponent({ urls }: GameComponentProps) {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} urls={urls} />
        </div>
    );
}

export default GameComponent;
