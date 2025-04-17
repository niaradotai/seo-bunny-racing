import { EventBus } from "../event-bus";
import { Scene } from "phaser";
import { PageSpeedResult } from "../../api/pagespeed/route";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    countdownText: Phaser.GameObjects.Text;
    countdownTimer: Phaser.Time.TimerEvent | null;
    pageSpeedResults: PageSpeedResult[];

    constructor() {
        super("Game");
        this.camera = this.cameras.main;
        this.background = this.add.image(0, 0, ""); // Provide a default image or use null
        this.gameText = this.add.text(0, 0, ""); // Provide default text
        this.countdownText = this.add.text(0, 0, "");
        this.countdownTimer = null;
        this.pageSpeedResults = [];
    }

    create() {
        this.camera.setBackgroundColor(0x00ff00);

        this.background.setPosition(512, 384);
        this.background.setTexture("background");
        this.background.setAlpha(0.5);

        this.gameText.setPosition(512, 384);
        this.gameText.setText(
            "Make something fun!\nand share it with us:\nsupport@phaser.io"
        );
        this.gameText.setFontFamily("Arial Black");
        this.gameText.setFontSize(38);
        this.gameText.setColor("#ffffff");
        this.gameText.setStroke("#000000", 8);
        this.gameText.setAlign("center");
        this.gameText.setOrigin(0.5);
        this.gameText.setDepth(100);

        this.countdownText = this.add
            .text(512, 200, "3", {
                fontFamily: "Arial Black",
                fontSize: 64,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);

        EventBus.on(
            "set-page-speed-results",
            (pageSpeedResults: PageSpeedResult[]) => {
                this.pageSpeedResults = pageSpeedResults;
                console.log(
                    "PageSpeed results received in Game:",
                    this.pageSpeedResults
                );
            }
        );

        let timeLeft = 3;
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                timeLeft--;
                this.countdownText.setText(timeLeft.toString());
                if (timeLeft === 0) {
                    this.countdownText.destroy();
                    EventBus.emit("current-scene-ready", this);
                    this.createRabbits(this.pageSpeedResults);
                }
            },
            callbackScope: this,
        });
    }

    createRabbits(pageSpeedResults: PageSpeedResult[]) {
        pageSpeedResults.forEach((result, index) => {
            const rabbit = this.add.sprite(100, 300 + index * 50, "bunny");
            rabbit.setScale(0.2);
            const speed = result.score / 10; // Adjust speed as needed
            this.tweens.add({
                targets: rabbit,
                x: 900,
                duration: 10000 / speed, // Adjust duration based on speed
                ease: "Linear",
                repeat: 0,
                onComplete: () => {
                    this.determineWinner();
                },
            });
        });
    }

    determineWinner() {
        const sortedResults = [...this.pageSpeedResults].sort(
            (a, b) => b.score - a.score
        );
        const winner = sortedResults[0];
        console.log("Winner:", winner);
        this.scene.start("Results", {
            pageSpeedResults: this.pageSpeedResults,
        });
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}
