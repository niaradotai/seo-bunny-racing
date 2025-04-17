import { EventBus } from "../event-bus";
import { Scene } from "phaser";

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;

    constructor() {
        super("GameOver");
        this.camera = this.cameras.main;
        this.background = this.add.image(0, 0, ""); // Provide a default image or use null
        this.gameOverText = this.add.text(0, 0, ""); // Provide default text
    }

    create() {
        this.camera.setBackgroundColor(0xff0000);

        this.background.setPosition(512, 384);
        this.background.setTexture("background");
        this.background.setAlpha(0.5);

        this.gameOverText.setPosition(512, 384);
        this.gameOverText.setText("Game Over");
        this.gameOverText.setFontFamily("Arial Black");
        this.gameOverText.setFontSize(64);
        this.gameOverText.setColor("#ffffff");
        this.gameOverText.setStroke("#000000", 8);
        this.gameOverText.setAlign("center");
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setDepth(100);

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("MainMenu");
    }
}
