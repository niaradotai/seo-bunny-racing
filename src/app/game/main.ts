import { Boot } from "./scenes/boot";
import { GameOver } from "./scenes/game-over";
import { Game as MainGame } from "./scenes/game";
import { MainMenu } from "./scenes/main-menu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/preloader";
import { Results } from "./scenes/results";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#028af8",
    scene: [Boot, Preloader, MainMenu, MainGame, GameOver, Results],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: "100%",
        height: "100%",
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
